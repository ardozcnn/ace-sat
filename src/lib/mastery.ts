import type {
  Attempt,
  Difficulty,
  StudentProfile,
  TopicId,
  TopicMastery,
} from "./types";
import { TOPICS } from "./topics";

const LEARNING_RATE = 0.18;
const FORGET_HALF_LIFE_DAYS = 14;

export function emptyMastery(topic: TopicId): TopicMastery {
  return {
    topic,
    mastery: 0.35,
    attempts: 0,
    correct: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    lastSeenAt: null,
    avgTimeMs: 0,
    workingDifficulty: 2,
  };
}

export function createDefaultMastery(): Record<TopicId, TopicMastery> {
  return Object.fromEntries(
    TOPICS.map((t) => [t.id, emptyMastery(t.id)]),
  ) as Record<TopicId, TopicMastery>;
}

/** Difficulty-aware master update: hard correct moves mastery more than easy correct. */
export function updateMasteryAfterAttempt(
  mastery: TopicMastery,
  correct: boolean,
  difficulty: Difficulty,
  timeMs: number,
): TopicMastery {
  const diffWeight = 0.6 + difficulty * 0.1; // 0.7–1.1
  const target = correct ? Math.min(1, 0.55 + difficulty * 0.09) : Math.max(0, 0.25 - (5 - difficulty) * 0.04);
  const delta = (target - mastery.mastery) * LEARNING_RATE * diffWeight;
  let nextMastery = clamp(mastery.mastery + delta, 0.05, 0.98);

  // Fast wrong answers (guessing) punish slightly more at medium+ difficulty
  if (!correct && timeMs < 8000 && difficulty >= 2) {
    nextMastery = clamp(nextMastery - 0.03, 0.05, 0.98);
  }

  const attempts = mastery.attempts + 1;
  const correctCount = mastery.correct + (correct ? 1 : 0);
  const avgTimeMs =
    mastery.attempts === 0
      ? timeMs
      : Math.round((mastery.avgTimeMs * mastery.attempts + timeMs) / attempts);

  let workingDifficulty = mastery.workingDifficulty;
  const consecutiveCorrect = correct ? mastery.consecutiveCorrect + 1 : 0;
  const consecutiveWrong = correct ? 0 : mastery.consecutiveWrong + 1;

  if (consecutiveCorrect >= 2 && workingDifficulty < 5) {
    workingDifficulty = (workingDifficulty + 1) as Difficulty;
  }
  if (consecutiveWrong >= 2 && workingDifficulty > 1) {
    workingDifficulty = (workingDifficulty - 1) as Difficulty;
  }

  return {
    ...mastery,
    mastery: nextMastery,
    attempts,
    correct: correctCount,
    consecutiveCorrect,
    consecutiveWrong,
    lastSeenAt: Date.now(),
    avgTimeMs,
    workingDifficulty,
  };
}

/** Spaced-repetition style boost for urgency: lower when recently practiced well. */
export function effectiveWeakness(m: TopicMastery, now = Date.now()): number {
  const daysSince =
    m.lastSeenAt == null ? 21 : (now - m.lastSeenAt) / (1000 * 60 * 60 * 24);
  const forgetFactor = 1 - Math.exp(-daysSince / FORGET_HALF_LIFE_DAYS);
  const base = 1 - m.mastery;
  const recencyPenalty = forgetFactor * 0.25;
  return clamp(base + recencyPenalty, 0, 1.2);
}

export function rankedWeakTopics(
  profile: StudentProfile,
  limit = 4,
): TopicId[] {
  return (Object.values(profile.mastery) as TopicMastery[])
    .map((m) => ({ topic: m.topic, score: effectiveWeakness(m) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.topic);
}

export function overallMastery(profile: StudentProfile): number {
  const values = Object.values(profile.mastery) as TopicMastery[];
  if (!values.length) return 0;
  return values.reduce((s, m) => s + m.mastery, 0) / values.length;
}

/** Rough Digital SAT style composite projection (400–1600) from mastery. */
export function projectedScore(profile: StudentProfile): number {
  const mathTopics = TOPICS.filter((t) => t.section === "math").map((t) => t.id);
  const rwTopics = TOPICS.filter((t) => t.section === "rw").map((t) => t.id);

  const avg = (ids: TopicId[]) =>
    ids.reduce((s, id) => s + profile.mastery[id].mastery, 0) / ids.length;

  const math = Math.round(200 + avg(mathTopics) * 600);
  const rw = Math.round(200 + avg(rwTopics) * 600);
  // blend toward target slightly so motivational curve feels responsive
  const raw = math + rw;
  return clamp(Math.round(raw / 10) * 10, 400, 1600);
}

export function accuracy(profile: StudentProfile, topic?: TopicId): number | null {
  if (topic) {
    const m = profile.mastery[topic];
    if (m.attempts === 0) return null;
    return m.correct / m.attempts;
  }
  if (profile.attempts.length === 0) return null;
  const c = profile.attempts.filter((a) => a.correct).length;
  return c / profile.attempts.length;
}

export function recentTrend(attempts: Attempt[], window = 8): "up" | "flat" | "down" {
  if (attempts.length < 4) return "flat";
  const slice = attempts.slice(-window);
  const mid = Math.floor(slice.length / 2);
  const first = slice.slice(0, mid);
  const second = slice.slice(mid);
  const rate = (xs: Attempt[]) =>
    xs.length ? xs.filter((a) => a.correct).length / xs.length : 0;
  const d = rate(second) - rate(first);
  if (d > 0.12) return "up";
  if (d < -0.12) return "down";
  return "flat";
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

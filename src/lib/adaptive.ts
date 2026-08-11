import { getAllQuestions, getQuestionById } from "./questions";
import type {
  Difficulty,
  Question,
  Section,
  StudentProfile,
  TopicId,
} from "./types";
import { sectionOf } from "./path";
import { ensureFreshQuestion } from "./generate";

export interface SelectionOptions {
  topic?: TopicId;
  section?: Section;
  difficulty?: Difficulty;
  preferReview?: boolean;
  /** force avoid these ids (recent / just answered) */
  excludeIds?: string[];
}

/**
 * Strict selector: never crosses out of the requested topic/section.
 * Avoids recent repeats; returns null if only exhausted repeats remain.
 */
export function selectNextQuestion(
  profile: StudentProfile,
  options: SelectionOptions = {},
): Question | null {
  const topic = options.topic ?? profile.focusBlock?.topic;
  const section =
    options.section ??
    (topic ? sectionOf(topic) : profile.focusBlock?.section) ??
    undefined;

  const recent = new Set([
    ...profile.attempts.slice(-10).map((a) => a.questionId),
    ...(options.excludeIds ?? []),
  ]);
  const seen = new Set(profile.seenQuestionIds);
  const missedIds = profile.attempts
    .filter((a) => !a.correct)
    .map((a) => a.questionId)
    .filter((id) => !recent.has(id));

  const pool = getAllQuestions(profile.customQuestions ?? []);

  const inScope = (q: Question) => {
    if (topic && q.topic !== topic) return false;
    if (section && q.section !== section) return false;
    if (recent.has(q.id)) return false;
    return true;
  };

  if (options.preferReview) {
    for (let i = missedIds.length - 1; i >= 0; i--) {
      const q = getQuestionById(missedIds[i], profile.customQuestions ?? []);
      if (q && inScope(q)) return q;
    }
  }

  if (!topic && !section) return null;

  const working =
    options.difficulty ??
    (topic ? profile.mastery[topic]?.workingDifficulty : undefined) ??
    2;

  const scoped = pool.filter(inScope);

  const score = (q: Question) => {
    let s = Math.abs(q.difficulty - working);
    if (seen.has(q.id)) s += 5;
    // prefer bank variety then generated
    if (q.source === "generated" || q.source === "openai") s += 0.2;
    return s;
  };

  const candidates = [...scoped].sort((a, b) => score(a) - score(b));

  // Unseen first
  const unseen = candidates.filter((q) => !seen.has(q.id));
  if (unseen.length) {
    // random among top 3 similar difficulty for variety
    const top = unseen.slice(0, Math.min(3, unseen.length));
    return top[Math.floor(Math.random() * top.length)];
  }

  // Seen but not recent — shuffle recycle
  if (candidates.length) {
    const top = candidates.slice(0, Math.min(4, candidates.length));
    return top[Math.floor(Math.random() * top.length)];
  }

  // Everything was recent → signal caller to generate
  return null;
}

/** Pick or generate a guaranteed-fresh question; mutates profile custom bank. */
export function resolveQuestion(
  profile: StudentProfile,
  options: SelectionOptions & { topic: TopicId },
): { profile: StudentProfile; question: Question } {
  return ensureFreshQuestion(profile, {
    topic: options.topic,
    difficulty: options.difficulty,
    preferReview: options.preferReview,
    selectFn: (p, opts) =>
      selectNextQuestion(p, {
        ...opts,
        section: options.section ?? sectionOf(opts.topic),
        excludeIds: options.excludeIds,
      }),
  });
}

/** Diagnostic: finish ALL math skills first, then R&W — no interleaving */
export function nextDiagnosticTopic(profile: StudentProfile): TopicId | null {
  // If student locked a section preference during diag, stay there for remaining untested skills
  const prefer = profile.preferredSection;
  const mathPath: TopicId[] = [
    "algebra",
    "problem_solving",
    "advanced_math",
    "geometry",
  ];
  const rwPath: TopicId[] = [
    "information_ideas",
    "craft_structure",
    "standard_english",
    "expression_ideas",
  ];

  const counts: Partial<Record<TopicId, number>> = {};
  for (const a of profile.attempts) {
    counts[a.topic] = (counts[a.topic] ?? 0) + 1;
  }

  const order =
    prefer === "math"
      ? mathPath
      : prefer === "rw"
        ? rwPath
        : [...mathPath, ...rwPath];

  for (const t of order) {
    if ((counts[t] ?? 0) < 1) return t;
  }

  // auto mode incomplete other section
  if (prefer === "math") {
    for (const t of rwPath) {
      if ((counts[t] ?? 0) < 1) return t;
    }
  }
  if (prefer === "rw") {
    for (const t of mathPath) {
      if ((counts[t] ?? 0) < 1) return t;
    }
  }

  return null;
}

export function diagnosticProgress(profile: StudentProfile): {
  done: number;
  total: number;
  phase: "math" | "rw" | "done";
} {
  const total = 8;
  const done = Math.min(
    new Set(profile.attempts.map((a) => a.topic)).size,
    total,
  );
  const topic = nextDiagnosticTopic(profile);
  if (!topic) return { done: total, total, phase: "done" };
  return { done, total, phase: sectionOf(topic) };
}

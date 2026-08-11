import { TOPIC_MAP, TOPICS } from "./topics";
import type {
  FocusBlock,
  MasteryLevel,
  Section,
  StudentProfile,
  TopicId,
  TopicMastery,
} from "./types";

/** Questions per skill before Ace may rotate — Khan-style mission length */
export const SKILL_BLOCK_SIZE = 5;

/** Mastery score thresholds (Khan-like bands) */
export const LEVEL_THRESHOLDS = {
  familiar: 0.45,
  proficient: 0.68,
  mastered: 0.85,
} as const;

/** Foundational → stretch order inside each section */
export const SECTION_PATH: Record<Section, TopicId[]> = {
  math: ["algebra", "problem_solving", "advanced_math", "geometry"],
  rw: [
    "information_ideas",
    "craft_structure",
    "standard_english",
    "expression_ideas",
  ],
};

export function masteryLevel(m: TopicMastery): MasteryLevel {
  if (m.attempts === 0) return "not_started";
  if (m.mastery >= LEVEL_THRESHOLDS.mastered) return "mastered";
  if (m.mastery >= LEVEL_THRESHOLDS.proficient) return "proficient";
  if (m.mastery >= LEVEL_THRESHOLDS.familiar) return "familiar";
  return "needs_practice";
}

export function masteryLevelLabel(level: MasteryLevel): string {
  switch (level) {
    case "not_started":
      return "Not started";
    case "needs_practice":
      return "Needs practice";
    case "familiar":
      return "Familiar";
    case "proficient":
      return "Proficient";
    case "mastered":
      return "Mastered";
  }
}

export function isProficient(m: TopicMastery): boolean {
  const level = masteryLevel(m);
  return level === "proficient" || level === "mastered";
}

export function sectionOf(topic: TopicId): Section {
  return TOPIC_MAP[topic].section;
}

export function topicsInSection(section: Section): TopicId[] {
  return SECTION_PATH[section];
}

/** Weakest unfinished skills in path order (foundation first among equals) */
export function rankedWeakInSection(
  profile: StudentProfile,
  section: Section,
): TopicId[] {
  const path = SECTION_PATH[section];
  return [...path]
    .map((topic, pathIndex) => ({
      topic,
      pathIndex,
      mastery: profile.mastery[topic],
      weakness: 1 - profile.mastery[topic].mastery,
      proficient: isProficient(profile.mastery[topic]),
    }))
    .sort((a, b) => {
      // unfinished skills first
      if (a.proficient !== b.proficient) return a.proficient ? 1 : -1;
      // then highest weakness
      if (Math.abs(a.weakness - b.weakness) > 0.05) {
        return b.weakness - a.weakness;
      }
      // foundation-first tie-break
      return a.pathIndex - b.pathIndex;
    })
    .map((x) => x.topic);
}

export function nextSkillInPath(
  profile: StudentProfile,
  section: Section,
  exclude?: TopicId,
): TopicId {
  const ranked = rankedWeakInSection(profile, section).filter(
    (t) => t !== exclude,
  );
  return ranked[0] ?? SECTION_PATH[section][0];
}

/** Prefer the weaker section when starting a new mission (not random) */
export function preferredSection(profile: StudentProfile): Section {
  const mathAvg =
    SECTION_PATH.math.reduce((s, t) => s + profile.mastery[t].mastery, 0) /
    SECTION_PATH.math.length;
  const rwAvg =
    SECTION_PATH.rw.reduce((s, t) => s + profile.mastery[t].mastery, 0) /
    SECTION_PATH.rw.length;
  // If almost equal, keep continuity with last attempt
  if (Math.abs(mathAvg - rwAvg) < 0.04) {
    const last = profile.attempts[profile.attempts.length - 1];
    if (last) return sectionOf(last.topic);
  }
  return mathAvg <= rwAvg ? "math" : "rw";
}

export function createFocusBlock(
  topic: TopicId,
  targetCount = SKILL_BLOCK_SIZE,
): FocusBlock {
  return {
    section: sectionOf(topic),
    topic,
    answeredInBlock: 0,
    correctInBlock: 0,
    targetCount,
    startedAt: Date.now(),
  };
}

export function advanceFocusBlock(
  block: FocusBlock,
  correct: boolean,
): FocusBlock {
  return {
    ...block,
    answeredInBlock: block.answeredInBlock + 1,
    correctInBlock: block.correctInBlock + (correct ? 1 : 0),
  };
}

/**
 * End the skill mission only when the student has a fair sample OR clear proficiency.
 * Never ends mid-block just to mix Math/Reading.
 */
export function shouldCompleteSkillBlock(
  profile: StudentProfile,
  block: FocusBlock,
): { done: boolean; reason: string } {
  const m = profile.mastery[block.topic];
  const level = masteryLevel(m);

  if (m.consecutiveWrong >= 2) {
    return { done: false, reason: "support" };
  }

  if (
    level === "mastered" ||
    (level === "proficient" && m.consecutiveCorrect >= 2)
  ) {
    return {
      done: true,
      reason: "set done",
    };
  }

  if (block.answeredInBlock >= block.targetCount) {
    const rate =
      block.answeredInBlock === 0
        ? 0
        : block.correctInBlock / block.answeredInBlock;
    if (rate >= 0.6 || level === "familiar" || level === "proficient") {
      return {
        done: true,
        reason: "set done",
      };
    }
    return {
      done: false,
      reason: "keep going",
    };
  }

  return { done: false, reason: "in progress" };
}

export function pickNextFocusTopic(
  profile: StudentProfile,
  preferSection?: Section,
): TopicId {
  // Explicit student unit choice overrides plan day if set
  if (profile.preferredSection === "math" || profile.preferredSection === "rw") {
    return nextSkillInPath(profile, profile.preferredSection);
  }

  if (profile.diagnosticComplete && profile.plan) {
    const open = profile.plan.items.find((i) => !i.completed);
    if (open?.focus[0]) {
      if (!preferSection || sectionOf(open.focus[0]) === preferSection) {
        return open.focus[0];
      }
    }
  }

  const section = preferSection ?? preferredSection(profile);
  return nextSkillInPath(profile, section);
}

export function setPreferredSection(
  profile: StudentProfile,
  preferredSection: "auto" | "math" | "rw",
): StudentProfile {
  let next = { ...profile, preferredSection };
  if (preferredSection === "auto") {
    if (!next.focusBlock) {
      next = {
        ...next,
        focusBlock: createFocusBlock(pickNextFocusTopic(next)),
      };
    }
    return next;
  }
  const topic = nextSkillInPath(next, preferredSection);
  return {
    ...next,
    focusBlock: createFocusBlock(topic),
  };
}

export function migrateFocusFields(profile: StudentProfile): StudentProfile {
  const masteredTopics =
    profile.masteredTopics ??
    (Object.values(profile.mastery) as TopicMastery[])
      .filter((m) => isProficient(m))
      .map((m) => m.topic);

  let focusBlock = profile.focusBlock ?? null;
  if (!focusBlock && profile.diagnosticComplete) {
    const topic = pickNextFocusTopic({
      ...profile,
      preferredSection: profile.preferredSection ?? "auto",
      customQuestions: profile.customQuestions ?? [],
      masteredTopics,
      reminderDismissedDate: profile.reminderDismissedDate ?? null,
      dailyGoalMinutes: profile.dailyGoalMinutes ?? 30,
    } as StudentProfile);
    focusBlock = createFocusBlock(topic);
  }

  return {
    ...profile,
    preferredSection: profile.preferredSection ?? "auto",
    customQuestions: profile.customQuestions ?? [],
    masteredTopics,
    focusBlock,
    reminderDismissedDate: profile.reminderDismissedDate ?? null,
    dailyGoalMinutes: profile.dailyGoalMinutes ?? 30,
  };
}

export function sectionProgress(profile: StudentProfile, section: Section) {
  const topics = SECTION_PATH[section];
  const levels = topics.map((t) => masteryLevel(profile.mastery[t]));
  const proficient = levels.filter(
    (l) => l === "proficient" || l === "mastered",
  ).length;
  return {
    topics,
    proficient,
    total: topics.length,
    pct: Math.round((proficient / topics.length) * 100),
  };
}

export function allTopicsMeta() {
  return TOPICS;
}

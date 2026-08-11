import {
  nextDiagnosticTopic,
  resolveQuestion,
  diagnosticProgress,
} from "./adaptive";
import {
  createDefaultMastery,
  overallMastery,
  projectedScore,
  rankedWeakTopics,
  updateMasteryAfterAttempt,
} from "./mastery";
import { generateStudyPlan } from "./plan";
import { getQuestionById } from "./questions";
import {
  advanceFocusBlock,
  createFocusBlock,
  isProficient,
  masteryLevel,
  masteryLevelLabel,
  migrateFocusFields,
  nextSkillInPath,
  pickNextFocusTopic,
  sectionOf,
  setPreferredSection,
  shouldCompleteSkillBlock,
  SKILL_BLOCK_SIZE,
} from "./path";
import { topicLabel, sectionLabel } from "./topics";
import type {
  AgentDecision,
  AgentMessage,
  Attempt,
  Difficulty,
  Question,
  Section,
  StudentProfile,
  TopicId,
} from "./types";

function mid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createStudent(input: {
  name: string;
  targetScore?: number;
  testDate?: string | null;
  weeklyMinutes?: number;
}): StudentProfile {
  const name = input.name.trim() || "Student";
  return {
    id: mid(),
    name,
    createdAt: Date.now(),
    targetScore: input.targetScore ?? 1200,
    testDate: input.testDate ?? null,
    weeklyMinutes: input.weeklyMinutes ?? 210,
    mode: "guided",
    preferredSection: "auto",
    diagnosticComplete: false,
    mastery: createDefaultMastery(),
    attempts: [],
    plan: null,
    messages: [
      {
        id: mid(),
        role: "agent",
        content: `Hi ${name} — I'm Ace, your SAT tutor. I'll figure out where you need help, pick good practice for you, and keep a simple weekly plan. You can study Math, Reading & Writing, or let me choose.`,
        timestamp: Date.now(),
        meta: { action: "diagnose" },
      },
    ],
    seenQuestionIds: [],
    streakDays: 0,
    lastSessionDate: null,
    totalStudyMinutes: 0,
    focusBlock: null,
    masteredTopics: [],
    customQuestions: [],
    reminderDismissedDate: null,
    dailyGoalMinutes: 30,
  };
}

function ensureFocus(profile: StudentProfile): StudentProfile {
  const p = migrateFocusFields(profile);
  if (p.focusBlock) {
    // Respect student section lock
    if (
      p.preferredSection !== "auto" &&
      p.focusBlock.section !== p.preferredSection
    ) {
      const topic = nextSkillInPath(p, p.preferredSection);
      return { ...p, focusBlock: createFocusBlock(topic) };
    }
    return p;
  }
  if (!p.diagnosticComplete) return p;
  const topic = pickNextFocusTopic(p);
  return { ...p, focusBlock: createFocusBlock(topic) };
}

function pickResolved(
  profile: StudentProfile,
  topic: TopicId,
  difficulty?: Difficulty,
  preferReview = false,
): { profile: StudentProfile; question: Question } {
  return resolveQuestion(profile, {
    topic,
    section: sectionOf(topic),
    difficulty,
    preferReview,
    excludeIds: profile.attempts.slice(-1).map((a) => a.questionId),
  });
}

/**
 * Agent policy: observe mastery → decide action → resolve unique item.
 */
export function decideNext(profile: StudentProfile): {
  profile: StudentProfile;
  decision: AgentDecision;
  question: Question | null;
} {
  let p = ensureFocus(profile);

  // ——— Diagnostic ———
  if (!p.diagnosticComplete || new Set(p.attempts.map((a) => a.topic)).size < 8) {
    const topic = nextDiagnosticTopic(p);
    const progress = diagnosticProgress(p);
    if (topic) {
      const resolved = pickResolved(p, topic, 2);
      p = resolved.profile;
      const n = progress.done + 1;
      return {
        profile: p,
        question: resolved.question,
        decision: {
          action: "diagnose",
          reason: "Baseline check",
          topic,
          section: sectionOf(topic),
          difficulty: resolved.question.difficulty,
          questionId: resolved.question.id,
          message:
            progress.phase === "math"
              ? `Quick check ${n} of ${progress.total}: ${topicLabel(topic)}. We'll start with Math skills, then move into Reading & Writing.`
              : `Quick check ${n} of ${progress.total}: ${topicLabel(topic)}.`,
        },
      };
    }
  }

  if (!p.plan) {
    p = { ...p, plan: generateStudyPlan(p) };
    const topic = pickNextFocusTopic(p);
    p = { ...p, focusBlock: createFocusBlock(topic) };
    const resolved = pickResolved(p, topic);
    p = resolved.profile;
    return {
      profile: p,
      question: resolved.question,
      decision: {
        action: "update_plan",
        reason: "Plan ready",
        topic,
        section: sectionOf(topic),
        questionId: resolved.question.id,
        difficulty: resolved.question.difficulty,
        message: `Nice work — I mapped your starting point. Here's practice on ${topicLabel(topic)} to begin.`,
      },
    };
  }

  if (!p.focusBlock) {
    const topic = pickNextFocusTopic(p);
    p = { ...p, focusBlock: createFocusBlock(topic) };
  }

  const block = p.focusBlock!;
  const m = p.mastery[block.topic];
  const last = p.attempts[p.attempts.length - 1];
  const progressLine = `${block.answeredInBlock} of ${block.targetCount} on ${topicLabel(block.topic)}`;

  if (last && last.topic === block.topic && m.consecutiveWrong >= 2) {
    const lowered = Math.max(1, last.difficulty - 1) as Difficulty;
    const resolved = pickResolved(p, block.topic, lowered);
    p = resolved.profile;
    return {
      profile: p,
      question: resolved.question,
      decision: {
        action: "scaffold_lesson",
        reason: "Support",
        topic: block.topic,
        section: block.section,
        difficulty: lowered,
        questionId: resolved.question.id,
        message:
          block.section === "math"
            ? `This ${topicLabel(block.topic)} set was rough — let's try something simpler. You can use the calculator on the right if it helps.`
            : `Let's take ${topicLabel(block.topic)} a bit slower. Read carefully, then match the answer to the passage.`,
      },
    };
  }

  if (
    last &&
    !last.correct &&
    last.topic === block.topic &&
    block.answeredInBlock > 0 &&
    block.answeredInBlock % 3 === 0
  ) {
    const resolved = pickResolved(p, block.topic, undefined, true);
    if (resolved.question.id !== last.questionId) {
      p = resolved.profile;
      return {
        profile: p,
        question: resolved.question,
        decision: {
          action: "review_missed",
          reason: "Review",
          topic: block.topic,
          section: block.section,
          difficulty: resolved.question.difficulty,
          questionId: resolved.question.id,
          message: `One more on ${topicLabel(block.topic)} to lock it in.`,
        },
      };
    }
  }

  if (
    last &&
    last.correct &&
    last.topic === block.topic &&
    m.consecutiveCorrect >= 2 &&
    !shouldCompleteSkillBlock(p, block).done
  ) {
    const raised = Math.min(5, last.difficulty + 1) as Difficulty;
    const resolved = pickResolved(p, block.topic, raised);
    p = resolved.profile;
    return {
      profile: p,
      question: resolved.question,
      decision: {
        action: "raise_difficulty",
        reason: "Ready for more",
        topic: block.topic,
        section: block.section,
        difficulty: raised,
        questionId: resolved.question.id,
        message: `You're doing well with ${topicLabel(block.topic)}. Here's a harder one. (${progressLine})`,
      },
    };
  }

  const completion = shouldCompleteSkillBlock(p, block);
  if (completion.done || block.answeredInBlock >= block.targetCount + 2) {
    let nextTopic: TopicId;
    let switchedSection = false;

    if (p.preferredSection !== "auto") {
      nextTopic = nextSkillInPath(p, p.preferredSection, block.topic);
    } else {
      const nextTopicInSection = nextSkillInPath(p, block.section, block.topic);
      const proficientInSection = Object.values(p.mastery).filter(
        (tm) => sectionOf(tm.topic) === block.section && isProficient(tm),
      ).length;
      const stay =
        proficientInSection < 3 &&
        (!isProficient(p.mastery[nextTopicInSection]) ||
          nextTopicInSection !== block.topic);
      if (stay) {
        nextTopic = nextTopicInSection;
      } else {
        const other: Section = block.section === "math" ? "rw" : "math";
        nextTopic = nextSkillInPath(p, other);
        switchedSection = true;
      }
    }

    p = { ...p, focusBlock: createFocusBlock(nextTopic) };
    const resolved = pickResolved(p, nextTopic);
    p = resolved.profile;
    return {
      profile: p,
      question: resolved.question,
      decision: {
        action: switchedSection ? "switch_section" : "skill_complete",
        reason: "Next skill",
        topic: nextTopic,
        section: sectionOf(nextTopic),
        difficulty: resolved.question.difficulty,
        questionId: resolved.question.id,
        message: switchedSection
          ? `Great set on ${topicLabel(block.topic)}. Next up: ${sectionLabel(sectionOf(nextTopic))} — ${topicLabel(nextTopic)}.`
          : `Nice work on ${topicLabel(block.topic)}. Let's move to ${topicLabel(nextTopic)}.`,
      },
    };
  }

  const resolved = pickResolved(p, block.topic);
  p = resolved.profile;
  const q = resolved.question;
  const isReadingGuide = Boolean(q.passage) && q.section === "rw";

  if (p.attempts.length > 0 && p.attempts.length % 12 === 0) {
    p = { ...p, plan: generateStudyPlan(p) };
  }

  return {
    profile: p,
    question: q,
    decision: {
      action: isReadingGuide ? "reading_guide" : "practice",
      reason: "Practice",
      topic: block.topic,
      section: block.section,
      difficulty: q.difficulty,
      questionId: q.id,
      message: isReadingGuide
        ? `Read the passage carefully, then answer. Working on ${topicLabel(block.topic)} (${progressLine}).`
        : `Keep going with ${topicLabel(block.topic)}. ${progressLine}.`,
    },
  };
}

export function applyAttempt(
  profile: StudentProfile,
  input: {
    questionId: string;
    selectedChoiceId: string;
    timeMs: number;
    hintsUsed?: number;
  },
): {
  profile: StudentProfile;
  correct: boolean;
  explanation: string;
  decision: AgentDecision;
  question: Question | null;
} {
  let p = ensureFocus(profile);
  const question = getQuestionById(input.questionId, p.customQuestions ?? []);
  if (!question) {
    throw new Error("Question not found");
  }

  const correct = input.selectedChoiceId === question.correctChoiceId;
  const attempt: Attempt = {
    id: mid(),
    questionId: question.id,
    topic: question.topic,
    difficulty: question.difficulty,
    selectedChoiceId: input.selectedChoiceId,
    correct,
    timeMs: input.timeMs,
    timestamp: Date.now(),
    hintsUsed: input.hintsUsed ?? 0,
  };

  const mastery = {
    ...p.mastery,
    [question.topic]: updateMasteryAfterAttempt(
      p.mastery[question.topic],
      correct,
      question.difficulty,
      input.timeMs,
    ),
  };

  const seen = p.seenQuestionIds.includes(question.id)
    ? p.seenQuestionIds
    : [...p.seenQuestionIds, question.id];

  const attempts = [...p.attempts, attempt];
  const topicsTouched = new Set(attempts.map((a) => a.topic)).size;
  const diagnosticComplete = p.diagnosticComplete || topicsTouched >= 8;

  let focusBlock = p.focusBlock;
  if (!diagnosticComplete) {
    focusBlock = advanceFocusBlock(createFocusBlock(question.topic, 1), correct);
  } else {
    if (!focusBlock || focusBlock.topic !== question.topic) {
      focusBlock = createFocusBlock(question.topic);
    }
    focusBlock = advanceFocusBlock(focusBlock, correct);
    if (
      focusBlock.answeredInBlock >= focusBlock.targetCount &&
      focusBlock.correctInBlock / Math.max(1, focusBlock.answeredInBlock) < 0.6 &&
      focusBlock.targetCount < SKILL_BLOCK_SIZE + 2
    ) {
      focusBlock = { ...focusBlock, targetCount: focusBlock.targetCount + 2 };
    }
  }

  let masteredTopics = [...(p.masteredTopics ?? [])];
  if (
    isProficient(mastery[question.topic]) &&
    !masteredTopics.includes(question.topic)
  ) {
    masteredTopics = [...masteredTopics, question.topic];
  }

  let next: StudentProfile = {
    ...p,
    mastery,
    attempts,
    seenQuestionIds: seen,
    diagnosticComplete,
    focusBlock,
    masteredTopics,
    totalStudyMinutes:
      p.totalStudyMinutes + Math.max(1, Math.round(input.timeMs / 60000)),
    lastSessionDate: new Date().toISOString().slice(0, 10),
    streakDays: updateStreak(p),
  };

  if (diagnosticComplete && !next.plan) {
    next = { ...next, plan: generateStudyPlan(next) };
  } else if (attempts.length % 12 === 0) {
    next = { ...next, plan: generateStudyPlan(next) };
  }

  const decided = decideNext(next);
  next = decided.profile;

  const feedback: AgentMessage = {
    id: mid(),
    role: "agent",
    content: correct
      ? `Correct. ${question.explanation}`
      : `Not quite. ${question.explanation}`,
    timestamp: Date.now(),
    meta: { action: "explain", topic: question.topic },
  };
  const decisionMsg: AgentMessage = {
    id: mid(),
    role: "agent",
    content: decided.decision.message,
    timestamp: Date.now() + 1,
    meta: {
      action: decided.decision.action,
      topic: decided.decision.topic,
    },
  };

  next = {
    ...next,
    messages: [...next.messages, feedback, decisionMsg].slice(-100),
  };

  return {
    profile: next,
    correct,
    explanation: question.explanation,
    decision: decided.decision,
    question: decided.question,
  };
}

function updateStreak(profile: StudentProfile): number {
  const today = new Date().toISOString().slice(0, 10);
  if (!profile.lastSessionDate) return 1;
  if (profile.lastSessionDate === today) return Math.max(1, profile.streakDays);
  const prev = new Date(profile.lastSessionDate);
  const now = new Date(today);
  const diff = (now.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
  if (diff <= 1.5) return (profile.streakDays || 0) + 1;
  return 1;
}

export function agentChatReply(
  profile: StudentProfile,
  userText: string,
): { profile: StudentProfile; reply: string } {
  const p = ensureFocus(profile);
  const text = userText.toLowerCase();
  const weak = rankedWeakTopics(p, 3).map(topicLabel);
  const score = projectedScore(p);
  const masteryPct = Math.round(overallMastery(p) * 100);
  const block = p.focusBlock;
  const reminder = getStudyReminder(p);

  let nextProfile = p;
  let reply: string;

  if (/math|reading|r&w|rw/.test(text) && /switch|study|focus|practice|work on/.test(text)) {
    if (/math/.test(text)) {
      nextProfile = setPreferredSection(p, "math");
      reply = `Sounds good — we'll stick with Math for now, starting with ${topicLabel(nextProfile.focusBlock!.topic)}.`;
    } else {
      nextProfile = setPreferredSection(p, "rw");
      reply = `Perfect — Reading & Writing it is. We'll work on ${topicLabel(nextProfile.focusBlock!.topic)}.`;
    }
  } else if (/auto|both|you choose|decide/.test(text)) {
    nextProfile = setPreferredSection(p, "auto");
    reply = "I'll balance Math and Reading & Writing based on where you need the most help.";
  } else if (/plan|schedule|week|remind/.test(text)) {
    const plan = p.plan ?? generateStudyPlan(p);
    nextProfile = { ...p, plan };
    reply = `${reminder ? `${reminder}\n\n` : ""}This week, focus on: ${plan.priorities.map(topicLabel).join(", ")}. ${plan.summary}`;
  } else if (/mission|focus|skill|current/.test(text)) {
    reply = block
      ? `Right now we're on ${topicLabel(block.topic)} (${block.answeredInBlock} of ${block.targetCount} questions in this set). Your level here is ${masteryLevelLabel(masteryLevel(p.mastery[block.topic])).toLowerCase()}.`
      : "Start practice when you're ready — I'll pick a skill for you, or choose Math / Reading & Writing first.";
  } else if (/weak|struggle|gap/.test(text)) {
    reply = weak.length
      ? `The areas that need the most work right now: ${weak.join(", ")}. We'll stay with those until they feel easier.`
      : "I need a bit more practice data to see your weak spots — keep answering a few questions.";
  } else if (/score|progress|how am i/.test(text)) {
    reply = `You're roughly around a ${score} composite (goal ${p.targetScore}). Overall comfort with the skills is about ${masteryPct}%. ${p.streakDays > 1 ? `Nice ${p.streakDays}-day streak.` : "Come back tomorrow to build a streak."}`;
  } else if (/next|what should|start|practice/.test(text)) {
    const d = decideNext(p);
    nextProfile = d.profile;
    reply = d.decision.message;
  } else if (/desmos|calculator/.test(text)) {
    reply = "On Math questions you can use the graphing calculator beside the problem — graph, zoom, and check your thinking.";
  } else if (/why|how do you|how work/.test(text)) {
    reply =
      "I watch what you get right and wrong, then choose easier or harder questions and which skill to practice next. Your study plan updates as you improve.";
  } else {
    reply = `I'm here to help. You can ask about your plan, your progress, what to practice next, or say “study math” / “study reading.”`;
  }

  const messages: AgentMessage[] = [
    ...nextProfile.messages,
    {
      id: mid(),
      role: "student" as const,
      content: userText,
      timestamp: Date.now(),
    },
    {
      id: mid(),
      role: "agent" as const,
      content: reply,
      timestamp: Date.now() + 1,
    },
  ].slice(-100);

  return { profile: { ...nextProfile, messages }, reply };
}

export function startGuidedQuestion(profile: StudentProfile): {
  profile: StudentProfile;
  decision: AgentDecision;
  question: Question | null;
} {
  const decided = decideNext(ensureFocus(profile));
  return decided;
}

export { setPreferredSection };

export function getStudyReminder(profile: StudentProfile): string | null {
  const today = new Date().toISOString().slice(0, 10);
  if (profile.reminderDismissedDate === today) return null;
  if (profile.lastSessionDate === today) return null;
  if (!profile.plan) {
    return profile.diagnosticComplete
      ? null
      : "A short practice session will help me finish figuring out where to focus.";
  }
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = dayNames[new Date().getDay()];
  const item = profile.plan.items.find((i) => i.day === day);
  if (!item || item.completed) {
    const weak = rankedWeakTopics(profile, 1)[0];
    return weak
      ? `When you have ${profile.dailyGoalMinutes ?? 30} minutes, practice ${topicLabel(weak)}.`
      : `Ready for about ${profile.dailyGoalMinutes ?? 30} minutes of practice when you are.`;
  }
  return `Today's focus: about ${item.minutes} minutes on ${topicLabel(item.focus[0])}.`;
}

export function dismissReminder(profile: StudentProfile): StudentProfile {
  return {
    ...profile,
    reminderDismissedDate: new Date().toISOString().slice(0, 10),
  };
}

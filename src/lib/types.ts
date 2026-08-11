/** Core domain types for AceSAT adaptive agent */

export type Section = "math" | "rw";

export type TopicId =
  | "algebra"
  | "advanced_math"
  | "problem_solving"
  | "geometry"
  | "craft_structure"
  | "information_ideas"
  | "standard_english"
  | "expression_ideas";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

/** Khan-style mastery bands */
export type MasteryLevel =
  | "not_started"
  | "needs_practice"
  | "familiar"
  | "proficient"
  | "mastered";

export type AgentAction =
  | "diagnose"
  | "practice"
  | "review_missed"
  | "explain"
  | "update_plan"
  | "encourage"
  | "switch_topic"
  | "switch_section"
  | "raise_difficulty"
  | "lower_difficulty"
  | "skill_complete"
  | "scaffold_lesson"
  | "reading_guide"
  | "remind"
  | "generate_item";

export interface TopicMeta {
  id: TopicId;
  section: Section;
  label: string;
  shortLabel: string;
  description: string;
}

export interface Question {
  id: string;
  section: Section;
  topic: TopicId;
  difficulty: Difficulty;
  stem: string;
  passage?: string;
  choices: { id: string; text: string }[];
  correctChoiceId: string;
  explanation: string;
  skillTags: string[];
  suggestedSeconds: number;
  /** optional Desmos starter expressions (math) */
  desmosLatex?: string[];
  /** bank | procedural/AI generated | openai */
  source?: "bank" | "generated" | "openai";
  /** reading tutor: guided steps before answering */
  guidedReading?: boolean;
}

/**
 * Khan-style focus mission: stay on ONE skill (and its section)
 * until the block target or proficiency is hit. Never random Math↔Reading jumps.
 */
export interface FocusBlock {
  section: Section;
  topic: TopicId;
  answeredInBlock: number;
  correctInBlock: number;
  targetCount: number;
  startedAt: number;
}

export interface Attempt {
  id: string;
  questionId: string;
  topic: TopicId;
  difficulty: Difficulty;
  selectedChoiceId: string;
  correct: boolean;
  timeMs: number;
  timestamp: number;
  hintsUsed: number;
}

export interface TopicMastery {
  topic: TopicId;
  /** 0–1 calibrated mastery estimate */
  mastery: number;
  attempts: number;
  correct: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  lastSeenAt: number | null;
  avgTimeMs: number;
  /** difficulty where student currently performs best */
  workingDifficulty: Difficulty;
}

export interface WeeklyPlanItem {
  day: string;
  /** single primary skill for the day (Khan unit focus) */
  focus: TopicId[];
  section: Section;
  minutes: number;
  goal: string;
  completed: boolean;
}

export interface StudyPlan {
  generatedAt: number;
  testDate: string | null;
  weeklyMinutes: number;
  summary: string;
  items: WeeklyPlanItem[];
  priorities: TopicId[];
}

export interface AgentDecision {
  action: AgentAction;
  reason: string;
  topic?: TopicId;
  section?: Section;
  difficulty?: Difficulty;
  message: string;
  questionId?: string;
}

export interface AgentMessage {
  id: string;
  role: "agent" | "student" | "system";
  content: string;
  timestamp: number;
  meta?: {
    action?: AgentAction;
    topic?: TopicId;
  };
}

export interface StudentProfile {
  id: string;
  name: string;
  createdAt: number;
  targetScore: number;
  testDate: string | null;
  weeklyMinutes: number;
  mode: "guided" | "practice" | "review";
  /** Student-controlled unit focus */
  preferredSection: "auto" | "math" | "rw";
  diagnosticComplete: boolean;
  mastery: Record<TopicId, TopicMastery>;
  attempts: Attempt[];
  plan: StudyPlan | null;
  messages: AgentMessage[];
  seenQuestionIds: string[];
  streakDays: number;
  lastSessionDate: string | null;
  totalStudyMinutes: number;
  focusBlock: FocusBlock | null;
  masteredTopics: TopicId[];
  /** AI/procedural items stored for the student */
  customQuestions: Question[];
  /** coach reminder dismissed for ISO date */
  reminderDismissedDate: string | null;
  dailyGoalMinutes: number;
}

export interface SessionState {
  active: boolean;
  phase: "idle" | "question" | "feedback" | "plan" | "chat";
  currentQuestionId: string | null;
  currentDecision: AgentDecision | null;
  questionStartedAt: number | null;
  sessionCorrect: number;
  sessionAttempted: number;
}

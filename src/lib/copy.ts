import type { AgentAction } from "./types";

/** Friendly labels for internal agent actions (never show snake_case to students). */
export function actionLabel(action: AgentAction | string | undefined): string {
  switch (action) {
    case "diagnose":
      return "Getting to know you";
    case "practice":
      return "Practice";
    case "review_missed":
      return "Quick review";
    case "explain":
      return "Explanation";
    case "update_plan":
      return "Study plan";
    case "encourage":
      return "Keep going";
    case "switch_topic":
      return "New focus";
    case "switch_section":
      return "Switching focus";
    case "raise_difficulty":
      return "Challenge up";
    case "lower_difficulty":
      return "Let's slow down";
    case "skill_complete":
      return "Skill complete";
    case "scaffold_lesson":
      return "Back to basics";
    case "reading_guide":
      return "Reading practice";
    case "remind":
      return "Reminder";
    case "generate_item":
      return "Practice";
    default:
      return "Practice";
  }
}

export function difficultyPhrase(d: number): string {
  if (d <= 1) return "an easier one";
  if (d === 2) return "a warm-up question";
  if (d === 3) return "a solid practice question";
  if (d === 4) return "a tougher question";
  return "a stretch question";
}

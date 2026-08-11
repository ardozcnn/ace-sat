import { migrateFocusFields } from "./path";
import type { StudentProfile } from "./types";
import { sectionOf } from "./path";

const KEY = "acesat.student.v1";

export function loadProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentProfile;
    const withFocus = migrateFocusFields({
      ...parsed,
      focusBlock: parsed.focusBlock ?? null,
      masteredTopics: parsed.masteredTopics ?? [],
      preferredSection: parsed.preferredSection ?? "auto",
      customQuestions: parsed.customQuestions ?? [],
      reminderDismissedDate: parsed.reminderDismissedDate ?? null,
      dailyGoalMinutes: parsed.dailyGoalMinutes ?? 30,
    });
    // migrate plan items missing section
    if (withFocus.plan) {
      withFocus.plan = {
        ...withFocus.plan,
        items: withFocus.plan.items.map((item) => ({
          ...item,
          section: item.section ?? (item.focus[0] ? sectionOf(item.focus[0]) : "math"),
          focus: item.focus.slice(0, 1),
        })),
      };
    }
    return withFocus;
  } catch {
    return null;
  }
}

export function saveProfile(profile: StudentProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

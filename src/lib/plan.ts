import { overallMastery, projectedScore } from "./mastery";
import {
  preferredSection,
  rankedWeakInSection,
  SECTION_PATH,
  sectionOf,
} from "./path";
import { topicLabel, sectionLabel } from "./topics";
import type {
  Section,
  StudyPlan,
  StudentProfile,
  TopicId,
  WeeklyPlanItem,
} from "./types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/**
 * Weekly plan: exactly one skill (and one section) per weekday.
 * Never assigns Math + Reading on the same day.
 */
export function generateStudyPlan(profile: StudentProfile): StudyPlan {
  const weakMath = rankedWeakInSection(profile, "math");
  const weakRw = rankedWeakInSection(profile, "rw");
  const firstSection = preferredSection(profile);
  const second: Section = firstSection === "math" ? "rw" : "math";

  const weekly = Math.max(90, profile.weeklyMinutes || 210);
  const weekdayMinutes = Math.round((weekly * 0.82) / 5);
  const weekendMinutes = Math.round((weekly * 0.18) / 2);

  const weekSkills: { topic: TopicId; section: Section }[] = [
    { topic: (firstSection === "math" ? weakMath : weakRw)[0], section: firstSection },
    { topic: (second === "math" ? weakMath : weakRw)[0], section: second },
    { topic: (firstSection === "math" ? weakMath : weakRw)[1] ?? (firstSection === "math" ? weakMath : weakRw)[0], section: firstSection },
    { topic: (second === "math" ? weakMath : weakRw)[1] ?? (second === "math" ? weakMath : weakRw)[0], section: second },
    {
      // Friday = stretch on weakest overall remaining in first section
      topic: (firstSection === "math" ? weakMath : weakRw)[0],
      section: firstSection,
    },
  ];

  const items: WeeklyPlanItem[] = DAYS.map((day, idx) => {
    if (day === "Sat") {
      const topic = weekSkills[0].topic;
      return {
        day,
        focus: [topic],
        section: sectionOf(topic),
        minutes: weekendMinutes,
        goal: `Review the questions you missed on ${topicLabel(topic)}.`,
        completed: false,
      };
    }
    if (day === "Sun") {
      const topic = weekSkills[1].topic;
      return {
        day,
        focus: [topic],
        section: sectionOf(topic),
        minutes: Math.max(20, weekendMinutes - 5),
        goal: `Light practice on ${topicLabel(topic)}.`,
        completed: false,
      };
    }

    const slot = weekSkills[idx] ?? weekSkills[0];
    return {
      day,
      focus: [slot.topic],
      section: slot.section,
      minutes: weekdayMinutes,
      goal:
        day === "Fri"
          ? `Timed practice on ${topicLabel(slot.topic)}.`
          : `Focus on ${topicLabel(slot.topic)} until it feels solid.`,
      completed: false,
    };
  });

  const priorities = [
    ...new Set([
      ...weakMath.slice(0, 2),
      ...weakRw.slice(0, 2),
    ]),
  ].slice(0, 4);

  const score = projectedScore(profile);
  const masteryPct = Math.round(overallMastery(profile) * 100);
  const gap = profile.targetScore - score;
  const priorityLabels = priorities.map(topicLabel).join(", ");

  const summary =
    gap > 40
      ? `You're around ${score} toward a ${profile.targetScore} goal. This week we'll spend extra time on ${priorityLabels} (about ${masteryPct}% average comfort across skills).`
      : gap > 0
        ? `You're close — about ${score}, aiming for ${profile.targetScore}. Keep sharpening ${priorityLabels}.`
        : `You're at or above your goal (about ${score}). Stay sharp on ${priorityLabels}.`;

  return {
    generatedAt: Date.now(),
    testDate: profile.testDate,
    weeklyMinutes: weekly,
    summary,
    items,
    priorities,
  };
}

export function markPlanDayComplete(
  plan: StudyPlan,
  day: string,
): StudyPlan {
  return {
    ...plan,
    items: plan.items.map((item) =>
      item.day === day ? { ...item, completed: true } : item,
    ),
  };
}

export function pathLabels() {
  return {
    math: SECTION_PATH.math.map(topicLabel),
    rw: SECTION_PATH.rw.map(topicLabel),
  };
}

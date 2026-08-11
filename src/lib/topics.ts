import type { TopicId, TopicMeta } from "./types";

export const TOPICS: TopicMeta[] = [
  {
    id: "algebra",
    section: "math",
    label: "Algebra",
    shortLabel: "Alg",
    description: "Linear equations, inequalities, systems",
  },
  {
    id: "advanced_math",
    section: "math",
    label: "Advanced Math",
    shortLabel: "Adv",
    description: "Quadratics, polynomials, nonlinear functions",
  },
  {
    id: "problem_solving",
    section: "math",
    label: "Problem Solving & Data",
    shortLabel: "PSDA",
    description: "Ratios, percentages, statistics, data displays",
  },
  {
    id: "geometry",
    section: "math",
    label: "Geometry & Trig",
    shortLabel: "Geo",
    description: "Area, volume, angles, right triangles",
  },
  {
    id: "craft_structure",
    section: "rw",
    label: "Craft & Structure",
    shortLabel: "Craft",
    description: "Word meaning, text structure, purpose",
  },
  {
    id: "information_ideas",
    section: "rw",
    label: "Information & Ideas",
    shortLabel: "Info",
    description: "Main idea, evidence, inference, command of evidence",
  },
  {
    id: "standard_english",
    section: "rw",
    label: "Standard English Conventions",
    shortLabel: "SEC",
    description: "Boundaries, form/structure/sense",
  },
  {
    id: "expression_ideas",
    section: "rw",
    label: "Expression of Ideas",
    shortLabel: "EOI",
    description: "Rhetorical synthesis, transitions, revision",
  },
];

export const TOPIC_MAP: Record<TopicId, TopicMeta> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
) as Record<TopicId, TopicMeta>;

export function topicLabel(id: TopicId): string {
  return TOPIC_MAP[id]?.label ?? id;
}

export function sectionLabel(section: "math" | "rw"): string {
  return section === "math" ? "Math" : "Reading & Writing";
}

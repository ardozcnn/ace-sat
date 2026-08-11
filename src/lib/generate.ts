import type {
  Difficulty,
  Question,
  Section,
  StudentProfile,
  TopicId,
} from "./types";
import { sectionOf } from "./path";

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function shuffleChoices(
  correct: string,
  wrongs: string[],
): { choices: { id: string; text: string }[]; correctChoiceId: string } {
  const texts = [correct, ...wrongs].slice(0, 4);
  while (texts.length < 4) texts.push(String(Number(correct) + texts.length + 1));
  const labeled = texts.map((text, i) => ({
    id: "ABCD"[i],
    text,
    isCorrect: text === correct,
  }));
  // Fisher-Yates
  for (let i = labeled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [labeled[i], labeled[j]] = [labeled[j], labeled[i]];
  }
  // re-label A-D in display order
  const choices = labeled.map((c, i) => ({
    id: "ABCD"[i],
    text: c.text,
  }));
  const correctChoiceId =
    choices.find((c) => c.text === correct)?.id ?? "A";
  return { choices, correctChoiceId };
}

function clampDiff(d: number): Difficulty {
  return Math.max(1, Math.min(5, Math.round(d))) as Difficulty;
}

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Infinite unique Digital-SAT-style items — procedural “local AI” when bank is empty. */
export function generateLocalQuestion(input: {
  topic: TopicId;
  difficulty?: Difficulty;
  avoidStems?: string[];
}): Question {
  const difficulty = clampDiff(input.difficulty ?? 2);
  const section = sectionOf(input.topic);
  const avoid = new Set(input.avoidStems ?? []);

  for (let attempt = 0; attempt < 12; attempt++) {
    const q =
      section === "math"
        ? genMath(input.topic, difficulty)
        : genRw(input.topic, difficulty);
    if (!avoid.has(q.stem)) return q;
  }
  return section === "math"
    ? genMath(input.topic, difficulty)
    : genRw(input.topic, difficulty);
}

function genMath(topic: TopicId, difficulty: Difficulty): Question {
  switch (topic) {
    case "algebra":
      return genAlgebra(difficulty);
    case "advanced_math":
      return genAdvanced(difficulty);
    case "problem_solving":
      return genPsd(difficulty);
    case "geometry":
    default:
      return genGeo(difficulty);
  }
}

function genAlgebra(d: Difficulty): Question {
  const a = randInt(2, 2 + d * 2);
  const x = randInt(1, 4 + d);
  const b = randInt(1, 12);
  const c = a * x + b;
  const wrongs = [x + 1, x - 1, c, a + b].map(String);
  const { choices, correctChoiceId } = shuffleChoices(String(x), wrongs);
  return {
    id: uid("gen-alg"),
    section: "math",
    topic: "algebra",
    difficulty: d,
    stem: `If ${a}x + ${b} = ${c}, what is the value of x?`,
    choices,
    correctChoiceId,
    explanation: `Subtract ${b}: ${a}x = ${c - b}. Divide by ${a}: x = ${x}.`,
    skillTags: ["linear equations", "generated"],
    suggestedSeconds: 50 + d * 10,
    desmosLatex: [`y=${a}x+${b}`, `y=${c}`],
    source: "generated",
  };
}

function genAdvanced(d: Difficulty): Question {
  const r1 = randInt(1, 3 + d);
  const r2 = randInt(r1 + 1, r1 + 2 + d);
  // (x-r1)(x-r2) = x^2 - (r1+r2)x + r1*r2
  const sum = r1 + r2;
  const prod = r1 * r2;
  const correct = `x = ${r1} and x = ${r2}`;
  const wrongs = [
    `x = ${-r1} and x = ${-r2}`,
    `x = ${r1} and x = ${-r2}`,
    `x = ${sum} and x = ${prod}`,
  ];
  const { choices, correctChoiceId } = shuffleChoices(correct, wrongs);
  return {
    id: uid("gen-adv"),
    section: "math",
    topic: "advanced_math",
    difficulty: d,
    stem: `What are the solutions to x² − ${sum}x + ${prod} = 0?`,
    choices,
    correctChoiceId,
    explanation: `Factor: (x − ${r1})(x − ${r2}) = 0 → x = ${r1} or x = ${r2}.`,
    skillTags: ["quadratics", "generated"],
    suggestedSeconds: 60 + d * 8,
    desmosLatex: [`y=x^2-${sum}x+${prod}`],
    source: "generated",
  };
}

function genPsd(d: Difficulty): Question {
  const base = 20 * randInt(2, 4);
  const pct = 5 * randInt(2, 3 + d);
  const result = Math.round(base * (1 + pct / 100));
  const wrongs = [
    String(base + pct),
    String(Math.round(base * (pct / 100))),
    String(base * 2),
  ];
  const { choices, correctChoiceId } = shuffleChoices(String(result), wrongs);
  return {
    id: uid("gen-psd"),
    section: "math",
    topic: "problem_solving",
    difficulty: d,
    stem: `A price of $${base} is increased by ${pct}%. What is the new price?`,
    choices,
    correctChoiceId,
    explanation: `${pct}% of ${base} is ${base * (pct / 100)}. New price = ${base} + ${base * (pct / 100)} = ${result}.`,
    skillTags: ["percentages", "generated"],
    suggestedSeconds: 45 + d * 8,
    source: "generated",
  };
}

function genGeo(d: Difficulty): Question {
  // scaled 3-4-5 triangle — clean integer hypotenuse
  const k = randInt(1, 1 + Math.floor(d / 2) + 1);
  const L1 = 3 * k;
  const L2 = 4 * k;
  const H = 5 * k;
  const wrongs = [String(L1 + L2), String(H + k), String(Math.abs(H - k) || H + 2)];
  const { choices, correctChoiceId } = shuffleChoices(String(H), wrongs);
  return {
    id: uid("gen-geo"),
    section: "math",
    topic: "geometry",
    difficulty: d,
    stem: `A right triangle has legs of length ${L1} and ${L2}. What is the length of the hypotenuse?`,
    choices,
    correctChoiceId,
    explanation: `Pythagorean: √(${L1}² + ${L2}²) = √(${L1 * L1 + L2 * L2}) = ${H}.`,
    skillTags: ["Pythagorean theorem", "generated"],
    suggestedSeconds: 40 + d * 10,
    source: "generated",
  };
}

const PASSAGES = [
  {
    text: "City planners planted tree corridors to cool walking routes. Early heat maps show lower midday temperatures on those paths, while ridership on nearby buses rose slightly as more residents walked to stops.",
    main: "Tree corridors cooled routes and may have encouraged more transit access on foot.",
    wrong: [
      "Bus ridership fell because trees blocked sidewalks.",
      "Heat maps prove trees always increase housing prices.",
      "Planners only cared about decorative landscaping.",
    ],
  },
  {
    text: "The chemist published partial results with cautious wording, noting replication was still underway. Critics accused her of hype; supporters said restraint was the responsible scientific stance.",
    main: "The chemist’s cautious publication reflects scientific restraint amid incomplete replication.",
    wrong: [
      "Critics proved the results were fabricated.",
      "Supporters wanted the paper delayed forever.",
      "Replication was already finished and ignored.",
    ],
  },
  {
    text: "After evening library hours expanded, adult workshop waitlists shortened even though total book checkouts stayed flat. Staff concluded demand shifted toward services, not just print borrowing.",
    main: "Longer evening hours met demand for services more than for print checkouts.",
    wrong: [
      "Book checkouts doubled after hours expanded.",
      "Workshop waitlists grew when hours expanded.",
      "Staff concluded print borrowing is obsolete everywhere.",
    ],
  },
];

function genRw(topic: TopicId, d: Difficulty): Question {
  if (topic === "standard_english") {
    const options = [
      {
        stem: "Which choice completes the sentence correctly?\n\nNeither the coaches nor the athlete ____ ready.",
        correct: "is",
        wrongs: ["are", "be", "were"],
        exp: "With neither…nor, the verb agrees with the nearer subject: athlete → is.",
      },
      {
        stem: "Which punctuation is correct?\n\nWhen the lights dimmed the audience grew quiet.",
        correct:
          "When the lights dimmed, the audience grew quiet.",
        wrongs: [
          "When the lights dimmed the audience, grew quiet.",
          "When, the lights dimmed the audience grew quiet.",
          "When the lights dimmed; the audience grew quiet.",
        ],
        exp: "Introductory clause needs a comma before the main clause.",
      },
      {
        stem: "Which choice maintains standard verb form?\n\nBy next June, the team ____ the report.",
        correct: "will have completed",
        wrongs: ["have complete", "completing", "was complete"],
        exp: "Future perfect (will have completed) fits a deadline in the future.",
      },
    ];
    const t = options[randInt(0, options.length - 1)];
    const { choices, correctChoiceId } = shuffleChoices(t.correct, t.wrongs);
    return {
      id: uid("gen-sec"),
      section: "rw",
      topic: "standard_english",
      difficulty: d,
      stem: t.stem,
      choices,
      correctChoiceId,
      explanation: t.exp,
      skillTags: ["conventions", "generated"],
      suggestedSeconds: 45 + d * 5,
      source: "generated",
    };
  }

  if (topic === "expression_ideas") {
    const { choices, correctChoiceId } = shuffleChoices("Nevertheless", [
      "Likewise",
      "For instance",
      "In other words",
    ]);
    return {
      id: uid("gen-eoi"),
      section: "rw",
      topic: "expression_ideas",
      difficulty: d,
      stem: "Which transition best completes the contrast?\n\nSolar output peaks on clear days. ____, cloudy days can still produce usable energy.",
      choices,
      correctChoiceId,
      explanation:
        "The second sentence contrasts with the first → Nevertheless.",
      skillTags: ["transitions", "generated"],
      suggestedSeconds: 40 + d * 5,
      source: "generated",
    };
  }

  // craft or information_ideas — passage + comprehension
  const p = PASSAGES[randInt(0, PASSAGES.length - 1)];
  const stem =
    topic === "craft_structure"
      ? "What is the author's primary purpose in the passage?"
      : "Which choice best states the main idea of the passage?";
  const { choices, correctChoiceId } = shuffleChoices(p.main, p.wrong);
  return {
    id: uid("gen-rw"),
    section: "rw",
    topic,
    difficulty: d,
    passage: p.text,
    stem: stem,
    choices,
    correctChoiceId,
    explanation: `The passage supports: ${p.main}`,
    skillTags: ["comprehension", "generated", "guided-reading"],
    suggestedSeconds: 70 + d * 8,
    source: "generated",
  };
}

/**
 * Merge static + student bank + append generated item when pool is exhausted.
 */
export function ensureFreshQuestion(
  profile: StudentProfile,
  input: {
    topic: TopicId;
    difficulty?: Difficulty;
    preferReview?: boolean;
    selectFn: (
      profile: StudentProfile,
      opts: {
        topic: TopicId;
        difficulty?: Difficulty;
        preferReview?: boolean;
      },
    ) => Question | null;
  },
): { profile: StudentProfile; question: Question } {
  const recent = new Set(
    profile.attempts.slice(-8).map((a) => a.questionId),
  );
  let q = input.selectFn(profile, {
    topic: input.topic,
    difficulty: input.difficulty,
    preferReview: input.preferReview,
  });

  if (q && !recent.has(q.id)) {
    return { profile, question: q };
  }

  // Try generate unique local item
  const avoidStems = [
    ...profile.customQuestions.map((c) => c.stem),
    ...(q ? [q.stem] : []),
  ];
  const generated = generateLocalQuestion({
    topic: input.topic,
    difficulty:
      input.difficulty ??
      profile.mastery[input.topic]?.workingDifficulty ??
      2,
    avoidStems,
  });

  const customQuestions = [...(profile.customQuestions ?? []), generated].slice(
    -200,
  );
  return {
    profile: { ...profile, customQuestions },
    question: generated,
  };
}

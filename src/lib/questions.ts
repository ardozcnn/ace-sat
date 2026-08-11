import type { Question } from "./types";

/**
 * Curated Digital SAT–style practice bank.
 * Enough variety for adaptive demos across 8 domains × difficulties.
 */
export const QUESTIONS: Question[] = [
  // ——— Algebra ———
  {
    id: "alg-01",
    section: "math",
    topic: "algebra",
    difficulty: 1,
    stem: "If 3x + 7 = 22, what is the value of x?",
    choices: [
      { id: "A", text: "3" },
      { id: "B", text: "5" },
      { id: "C", text: "7" },
      { id: "D", text: "15" },
    ],
    correctChoiceId: "B",
    explanation:
      "Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5. (Check: 3·5 + 7 = 22.)",
    skillTags: ["linear equations", "one-step isolation"],
    suggestedSeconds: 45,
    desmosLatex: ["y=3x+7", "y=22"],
  },
  {
    id: "alg-02",
    section: "math",
    topic: "algebra",
    difficulty: 2,
    stem: "A phone plan costs $30 per month plus $0.12 per text message. If a bill is $42.60 for one month, how many text messages were sent?",
    choices: [
      { id: "A", text: "90" },
      { id: "B", text: "105" },
      { id: "C", text: "120" },
      { id: "D", text: "355" },
    ],
    correctChoiceId: "B",
    explanation:
      "Let t = number of texts. 30 + 0.12t = 42.60 → 0.12t = 12.60 → t = 12.60 / 0.12 = 105.",
    skillTags: ["linear models", "word problems"],
    suggestedSeconds: 75,
  },
  {
    id: "alg-03",
    section: "math",
    topic: "algebra",
    difficulty: 3,
    stem: "Which value of x satisfies both 2x − y = 8 and x + y = 7?",
    choices: [
      { id: "A", text: "x = 3" },
      { id: "B", text: "x = 5" },
      { id: "C", text: "x = 7" },
      { id: "D", text: "x = 15" },
    ],
    correctChoiceId: "B",
    explanation:
      "Add the equations: 3x = 15 → x = 5. (Then y = 2.) Verify: 2(5) − 2 = 8 and 5 + 2 = 7.",
    skillTags: ["systems of equations", "elimination"],
    suggestedSeconds: 90,
  },
  {
    id: "alg-04",
    section: "math",
    topic: "algebra",
    difficulty: 4,
    stem: "For how many integer values of k does the inequality 1 < |2k − 5| ≤ 7 have a solution for k?",
    choices: [
      { id: "A", text: "4" },
      { id: "B", text: "5" },
      { id: "C", text: "6" },
      { id: "D", text: "7" },
    ],
    correctChoiceId: "C",
    explanation:
      "|2k−5| ≤ 7 → −7 ≤ 2k−5 ≤ 7 → −1 ≤ k ≤ 6. Also |2k−5| > 1 → k ≤ 1.5 or k ≥ 3.5. Integers k: −1,0,1 and 4,5,6 → 6 values.",
    skillTags: ["absolute value", "compound inequalities"],
    suggestedSeconds: 120,
  },
  {
    id: "alg-05",
    section: "math",
    topic: "algebra",
    difficulty: 2,
    stem: "If 4(x − 2) = 2x + 10, what is x?",
    choices: [
      { id: "A", text: "1" },
      { id: "B", text: "3" },
      { id: "C", text: "9" },
      { id: "D", text: "18" },
    ],
    correctChoiceId: "C",
    explanation: "4x − 8 = 2x + 10 → 2x = 18 → x = 9.",
    skillTags: ["linear equations", "distribution"],
    suggestedSeconds: 60,
  },

  // ——— Advanced Math ———
  {
    id: "adv-01",
    section: "math",
    topic: "advanced_math",
    difficulty: 2,
    stem: "What are the solutions to x² − 5x + 6 = 0?",
    choices: [
      { id: "A", text: "x = 1 and x = 6" },
      { id: "B", text: "x = 2 and x = 3" },
      { id: "C", text: "x = −2 and x = −3" },
      { id: "D", text: "x = 0 and x = 5" },
    ],
    correctChoiceId: "B",
    explanation: "Factor: (x − 2)(x − 3) = 0 → x = 2 or x = 3.",
    skillTags: ["quadratics", "factoring"],
    suggestedSeconds: 60,
    desmosLatex: ["y=x^2-5x+6"],
  },
  {
    id: "adv-02",
    section: "math",
    topic: "advanced_math",
    difficulty: 3,
    stem: "The function f(x) = 2(x − 1)² + 3 has a minimum value of:",
    choices: [
      { id: "A", text: "1" },
      { id: "B", text: "2" },
      { id: "C", text: "3" },
      { id: "D", text: "5" },
    ],
    correctChoiceId: "C",
    explanation:
      "Vertex form a(x − h)² + k has vertex (h, k). Here k = 3 and a > 0, so the minimum is 3.",
    skillTags: ["vertex form", "quadratic functions"],
    suggestedSeconds: 55,
    desmosLatex: ["y=2(x-1)^2+3"],
  },
  {
    id: "adv-03",
    section: "math",
    topic: "advanced_math",
    difficulty: 4,
    stem: "If g(x) = x² − 4x and h(x) = 2x − 1, what is g(h(2))?",
    choices: [
      { id: "A", text: "−3" },
      { id: "B", text: "0" },
      { id: "C", text: "3" },
      { id: "D", text: "5" },
    ],
    correctChoiceId: "A",
    explanation: "h(2) = 4 − 1 = 3. g(3) = 9 − 12 = −3.",
    skillTags: ["composition", "function evaluation"],
    suggestedSeconds: 70,
  },
  {
    id: "adv-04",
    section: "math",
    topic: "advanced_math",
    difficulty: 1,
    stem: "Which expression is equivalent to (x + 3)(x − 3)?",
    choices: [
      { id: "A", text: "x² − 9" },
      { id: "B", text: "x² + 9" },
      { id: "C", text: "x² − 6x − 9" },
      { id: "D", text: "x² + 6x + 9" },
    ],
    correctChoiceId: "A",
    explanation: "Difference of squares: (x + 3)(x − 3) = x² − 9.",
    skillTags: ["polynomials", "difference of squares"],
    suggestedSeconds: 40,
  },
  {
    id: "adv-05",
    section: "math",
    topic: "advanced_math",
    difficulty: 5,
    stem: "For what value of k does the equation x² + kx + 16 = 0 have exactly one real solution?",
    choices: [
      { id: "A", text: "k = 0" },
      { id: "B", text: "k = 4" },
      { id: "C", text: "k = 8" },
      { id: "D", text: "k = −4 only" },
    ],
    correctChoiceId: "C",
    explanation:
      "Discriminant zero: k² − 64 = 0 → k = ±8. Of the given single options, k = 8 works (k = −8 also, but not listed). Choice C is correct among the options.",
    skillTags: ["discriminant", "repeated roots"],
    suggestedSeconds: 90,
  },

  // ——— Problem Solving & Data ———
  {
    id: "psd-01",
    section: "math",
    topic: "problem_solving",
    difficulty: 1,
    stem: "A store marks a $40 shirt up by 25%. What is the new price?",
    choices: [
      { id: "A", text: "$45" },
      { id: "B", text: "$50" },
      { id: "C", text: "$55" },
      { id: "D", text: "$65" },
    ],
    correctChoiceId: "B",
    explanation: "25% of 40 is 10. New price = 40 + 10 = $50.",
    skillTags: ["percentages", "markups"],
    suggestedSeconds: 40,
  },
  {
    id: "psd-02",
    section: "math",
    topic: "problem_solving",
    difficulty: 2,
    stem: "A recipe needs 3 cups of flour for 12 muffins. How many cups of flour are needed for 20 muffins?",
    choices: [
      { id: "A", text: "4" },
      { id: "B", text: "5" },
      { id: "C", text: "6" },
      { id: "D", text: "8" },
    ],
    correctChoiceId: "B",
    explanation: "3/12 = x/20 → x = 3·20/12 = 5 cups.",
    skillTags: ["ratios", "proportions"],
    suggestedSeconds: 55,
  },
  {
    id: "psd-03",
    section: "math",
    topic: "problem_solving",
    difficulty: 3,
    stem: "The mean of five scores is 82. Four of the scores are 78, 85, 90, and 76. What is the fifth score?",
    choices: [
      { id: "A", text: "79" },
      { id: "B", text: "81" },
      { id: "C", text: "83" },
      { id: "D", text: "85" },
    ],
    correctChoiceId: "B",
    explanation: "Sum of five scores = 82 · 5 = 410. Known sum = 329. Fifth = 410 − 329 = 81.",
    skillTags: ["mean", "statistics"],
    suggestedSeconds: 70,
  },
  {
    id: "psd-04",
    section: "math",
    topic: "problem_solving",
    difficulty: 4,
    stem: "A car travels 150 miles at an average of 50 mph and then 120 miles at 40 mph. What is the average speed, in mph, for the entire trip?",
    choices: [
      { id: "A", text: "44" },
      { id: "B", text: "45" },
      { id: "C", text: "46" },
      { id: "D", text: "48" },
    ],
    correctChoiceId: "B",
    explanation:
      "Time1 = 150/50 = 3 h. Time2 = 120/40 = 3 h. Total distance 270 over 6 hours → 45 mph.",
    skillTags: ["rates", "average speed"],
    suggestedSeconds: 100,
  },
  {
    id: "psd-05",
    section: "math",
    topic: "problem_solving",
    difficulty: 2,
    stem: "In a class of 30 students, 18 prefer tea. What percent prefer tea?",
    choices: [
      { id: "A", text: "18%" },
      { id: "B", text: "40%" },
      { id: "C", text: "60%" },
      { id: "D", text: "80%" },
    ],
    correctChoiceId: "C",
    explanation: "18/30 = 0.6 = 60%.",
    skillTags: ["percentages", "ratios"],
    suggestedSeconds: 35,
  },

  // ——— Geometry ———
  {
    id: "geo-01",
    section: "math",
    topic: "geometry",
    difficulty: 1,
    stem: "A rectangle has length 12 and width 5. What is its area?",
    choices: [
      { id: "A", text: "17" },
      { id: "B", text: "34" },
      { id: "C", text: "60" },
      { id: "D", text: "120" },
    ],
    correctChoiceId: "C",
    explanation: "Area = length × width = 12 × 5 = 60.",
    skillTags: ["area", "rectangles"],
    suggestedSeconds: 30,
  },
  {
    id: "geo-02",
    section: "math",
    topic: "geometry",
    difficulty: 2,
    stem: "A right triangle has legs of length 6 and 8. What is the length of the hypotenuse?",
    choices: [
      { id: "A", text: "7" },
      { id: "B", text: "10" },
      { id: "C", text: "14" },
      { id: "D", text: "48" },
    ],
    correctChoiceId: "B",
    explanation: "Pythagorean theorem: √(36 + 64) = √100 = 10.",
    skillTags: ["Pythagorean theorem", "right triangles"],
    suggestedSeconds: 45,
  },
  {
    id: "geo-03",
    section: "math",
    topic: "geometry",
    difficulty: 3,
    stem: "A circle has radius 4. What is its circumference? (Use π ≈ 3.14)",
    choices: [
      { id: "A", text: "12.56" },
      { id: "B", text: "25.12" },
      { id: "C", text: "50.24" },
      { id: "D", text: "16" },
    ],
    correctChoiceId: "B",
    explanation: "C = 2πr ≈ 2 · 3.14 · 4 = 25.12.",
    skillTags: ["circles", "circumference"],
    suggestedSeconds: 50,
  },
  {
    id: "geo-04",
    section: "math",
    topic: "geometry",
    difficulty: 4,
    stem: "The volume of a cylinder is 36π cubic units and its height is 4. What is the radius of the base?",
    choices: [
      { id: "A", text: "2" },
      { id: "B", text: "3" },
      { id: "C", text: "4" },
      { id: "D", text: "9" },
    ],
    correctChoiceId: "B",
    explanation: "V = πr²h → 36π = πr²·4 → r² = 9 → r = 3.",
    skillTags: ["cylinders", "volume"],
    suggestedSeconds: 75,
  },

  // ——— Craft & Structure ———
  {
    id: "cs-01",
    section: "rw",
    topic: "craft_structure",
    difficulty: 2,
    passage:
      "The scientist spoke with measured restraint, careful not to overstate what the early results could prove.",
    stem: "As used in the sentence, \"measured\" most nearly means:",
    choices: [
      { id: "A", text: "calculated and controlled" },
      { id: "B", text: "formally evaluated" },
      { id: "C", text: "musically timed" },
      { id: "D", text: "officially recorded" },
    ],
    correctChoiceId: "A",
    explanation:
      "Context pairs \"measured\" with \"restraint\" and not overstating conclusions → careful, controlled speech.",
    skillTags: ["words in context", "nuance"],
    suggestedSeconds: 60,
  },
  {
    id: "cs-02",
    section: "rw",
    topic: "craft_structure",
    difficulty: 3,
    passage:
      "Paragraph 1 describes the city's transit shortage. Paragraph 2 shifts to three policy options. Paragraph 3 evaluates trade-offs. Paragraph 4 recommends a hybrid approach.",
    stem: "Which choice best describes the overall structure of the passage outline above?",
    choices: [
      { id: "A", text: "Problem → options → analysis → recommendation" },
      { id: "B", text: "Narrative chronology of a single rider's commute" },
      { id: "C", text: "Definition of a term followed by unrelated examples" },
      { id: "D", text: "Cause-and-effect chain ending without a claim" },
    ],
    correctChoiceId: "A",
    explanation:
      "The outline moves from problem to alternatives to evaluation to a recommended solution.",
    skillTags: ["text structure", "organization"],
    suggestedSeconds: 70,
  },
  {
    id: "cs-03",
    section: "rw",
    topic: "craft_structure",
    difficulty: 1,
    passage: "\"I can't believe this worked,\" Maya whispered, half-laughing as the circuit lit up.",
    stem: "The author's primary purpose in this sentence is to:",
    choices: [
      { id: "A", text: "convey Maya's surprised relief at success" },
      { id: "B", text: "argue that the circuit design is flawed" },
      { id: "C", text: "define a technical engineering term" },
      { id: "D", text: "compare two competing scientific theories" },
    ],
    correctChoiceId: "A",
    explanation:
      "\"I can't believe this worked\" plus half-laughing signals surprise and relief, not argument or definition.",
    skillTags: ["purpose", "tone"],
    suggestedSeconds: 50,
  },
  {
    id: "cs-04",
    section: "rw",
    topic: "craft_structure",
    difficulty: 4,
    passage:
      "Critics called the mural \"decorative,\" yet its historical portraits force viewers to confront erased names in the city's archive.",
    stem: "The word \"yet\" primarily functions to:",
    choices: [
      { id: "A", text: "contrast a dismissive label with the mural's deeper impact" },
      { id: "B", text: "introduce a chronological sequence of events" },
      { id: "C", text: "signal that the second clause restates the first" },
      { id: "D", text: "weaken the claim that the portraits are historical" },
    ],
    correctChoiceId: "A",
    explanation:
      "\"Yet\" marks contrast: surface criticism vs. substantive historical force of the work.",
    skillTags: ["transitions", "rhetorical function"],
    suggestedSeconds: 75,
  },

  // ——— Information & Ideas ———
  {
    id: "ii-01",
    section: "rw",
    topic: "information_ideas",
    difficulty: 2,
    passage:
      "Urban gardens reduce food transport costs, increase access to fresh produce, and give residents a shared maintenance project. Early studies also link participation to higher neighborhood trust scores.",
    stem: "Which choice best states the main idea of the passage?",
    choices: [
      { id: "A", text: "Urban gardens provide practical and social benefits for communities." },
      { id: "B", text: "Transport costs are the only reason to plant urban gardens." },
      { id: "C", text: "Trust scores fall when residents maintain gardens." },
      { id: "D", text: "Fresh produce is more expensive when grown locally." },
    ],
    correctChoiceId: "A",
    explanation:
      "The passage lists economic, access, and social benefits—summed as practical and social gains.",
    skillTags: ["main idea", "summarizing"],
    suggestedSeconds: 70,
  },
  {
    id: "ii-02",
    section: "rw",
    topic: "information_ideas",
    difficulty: 3,
    passage:
      "Table note: In Town A, after a free bus-pass pilot, ridership rose 18% while average car trips for the same cohorts fell 11%. Emissions estimates for the pilot corridor declined slightly.",
    stem: "Based on the note, which claim is best supported?",
    choices: [
      { id: "A", text: "The pilot likely shifted some trips from cars to buses." },
      { id: "B", text: "Emissions increased because more people used buses." },
      { id: "C", text: "Car trips rose faster than bus ridership." },
      { id: "D", text: "The pilot only changed weekend travel patterns." },
    ],
    correctChoiceId: "A",
    explanation:
      "Bus ridership up and car trips down for the same cohorts supports a shift away from car trips.",
    skillTags: ["command of evidence", "data interpretation"],
    suggestedSeconds: 80,
  },
  {
    id: "ii-03",
    section: "rw",
    topic: "information_ideas",
    difficulty: 1,
    passage:
      "Bees visit flowers not only for nectar but also for pollen. While gathering, they transfer pollen between plants, enabling reproduction in many crops.",
    stem: "According to the passage, bees help plants mainly by:",
    choices: [
      { id: "A", text: "transferring pollen that aids plant reproduction" },
      { id: "B", text: "building hives on crop stems" },
      { id: "C", text: "reducing the plants' need for water" },
      { id: "D", text: "preventing all insect pests" },
    ],
    correctChoiceId: "A",
    explanation: "The last sentence explicitly credits pollen transfer with enabling plant reproduction.",
    skillTags: ["details", "explicit information"],
    suggestedSeconds: 45,
  },
  {
    id: "ii-04",
    section: "rw",
    topic: "information_ideas",
    difficulty: 4,
    passage:
      "Author A argues that remote work boosts output because workers reclaim commute time. Author B replies that measured output gains often vanish after three months once informal collaboration declines.",
    stem: "How does Author B's reply relate to Author A's claim?",
    choices: [
      { id: "A", text: "It challenges the durability of the alleged productivity gain." },
      { id: "B", text: "It fully accepts the claim and extends it to all industries." },
      { id: "C", text: "It reframes the issue as a legal question about labor rights." },
      { id: "D", text: "It provides demographic data about commuters." },
    ],
    correctChoiceId: "A",
    explanation:
      "B does not deny short-term gains; B questions whether they last when collaboration fades.",
    skillTags: ["inference", "argument relationship"],
    suggestedSeconds: 90,
  },

  // ——— Standard English Conventions ———
  {
    id: "sec-01",
    section: "rw",
    topic: "standard_english",
    difficulty: 2,
    stem: "Which choice completes the sentence so that it conforms to Standard English conventions?\n\nThe museum's new wing, designed by an architect from Lisbon, ____ open next spring.",
    choices: [
      { id: "A", text: "will open" },
      { id: "B", text: "opening" },
      { id: "C", text: "to open" },
      { id: "D", text: "opened will" },
    ],
    correctChoiceId: "A",
    explanation:
      "The sentence needs a finite verb phrase matching future timing: \"will open.\"",
    skillTags: ["verb form", "sentence structure"],
    suggestedSeconds: 45,
  },
  {
    id: "sec-02",
    section: "rw",
    topic: "standard_english",
    difficulty: 3,
    stem: "Which choice correctly punctuates the sentence?\n\nWhen the storm finally eased the hikers set up camp near a stream.",
    choices: [
      { id: "A", text: "When the storm finally eased, the hikers set up camp near a stream." },
      { id: "B", text: "When the storm finally eased the hikers, set up camp near a stream." },
      { id: "C", text: "When the storm finally eased; the hikers set up camp near a stream." },
      { id: "D", text: "When, the storm finally eased the hikers set up camp near a stream." },
    ],
    correctChoiceId: "A",
    explanation:
      "An introductory dependent clause needs a comma before the main clause.",
    skillTags: ["punctuation", "boundaries"],
    suggestedSeconds: 50,
  },
  {
    id: "sec-03",
    section: "rw",
    topic: "standard_english",
    difficulty: 1,
    stem: "Which word is correct?\n\nNeither the teacher nor the students ____ ready to leave.",
    choices: [
      { id: "A", text: "was" },
      { id: "B", text: "were" },
      { id: "C", text: "is" },
      { id: "D", text: "be" },
    ],
    correctChoiceId: "B",
    explanation:
      "With neither…nor, the verb agrees with the nearer noun: \"students\" → plural \"were.\"",
    skillTags: ["subject-verb agreement", "correlatives"],
    suggestedSeconds: 40,
  },
  {
    id: "sec-04",
    section: "rw",
    topic: "standard_english",
    difficulty: 4,
    stem: "Which revision correctly joins the clauses?\n\nThe data set was incomplete. The team delayed publishing its report.",
    choices: [
      {
        id: "A",
        text: "The data set was incomplete; therefore, the team delayed publishing its report.",
      },
      {
        id: "B",
        text: "The data set was incomplete, therefore, the team delayed publishing its report.",
      },
      {
        id: "C",
        text: "The data set was incomplete therefore the team delayed publishing its report.",
      },
      {
        id: "D",
        text: "The data set was incomplete: therefore the team delayed publishing its report.",
      },
    ],
    correctChoiceId: "A",
    explanation:
      "A semicolon (or period) cleanly joins independent clauses with a conjunctive adverb. Comma-only creates a comma splice.",
    skillTags: ["sentence boundaries", "conjunctive adverbs"],
    suggestedSeconds: 65,
  },

  // ——— Expression of Ideas ———
  {
    id: "eoi-01",
    section: "rw",
    topic: "expression_ideas",
    difficulty: 2,
    stem: "Which transition best completes the logic?\n\nSolar panels produce more power on cloudless days. ____, cloudy weather can still yield usable energy.",
    choices: [
      { id: "A", text: "Nevertheless" },
      { id: "B", text: "Likewise" },
      { id: "C", text: "For example" },
      { id: "D", text: "In other words" },
    ],
    correctChoiceId: "A",
    explanation:
      "The second sentence contrasts with the first's emphasis on clear days → contrast transition \"Nevertheless.\"",
    skillTags: ["transitions", "logical relationships"],
    suggestedSeconds: 50,
  },
  {
    id: "eoi-02",
    section: "rw",
    topic: "expression_ideas",
    difficulty: 3,
    stem: "Which sentence most effectively combines the information?\n\nRiver cleanup days attract volunteers. The river's water quality has improved each year since 2019.",
    choices: [
      {
        id: "A",
        text: "Since 2019, volunteer river cleanup days have been associated with yearly improvements in water quality.",
      },
      {
        id: "B",
        text: "Cleanup days attract volunteers, and water quality improved, and that started in 2019 somehow.",
      },
      {
        id: "C",
        text: "Volunteers clean rivers while water quality, improving yearly since 2019, remain unrelated.",
      },
      {
        id: "D",
        text: "Water quality improved each year since 2019 despite cleanup days attracting volunteers.",
      },
    ],
    correctChoiceId: "A",
    explanation:
      "A links the two facts clearly and professionally without inventing opposition or wordiness.",
    skillTags: ["synthesis", "concision"],
    suggestedSeconds: 70,
  },
  {
    id: "eoi-03",
    section: "rw",
    topic: "expression_ideas",
    difficulty: 1,
    stem: "Which choice best maintains the formal tone of a research summary?\n\nThe experiment ____ that the new alloy resists corrosion.",
    choices: [
      { id: "A", text: "indicates" },
      { id: "B", text: "totally shows" },
      { id: "C", text: "kinda proves" },
      { id: "D", text: "screams" },
    ],
    correctChoiceId: "A",
    explanation: "\"Indicates\" is precise and formal; the other options are colloquial or hyperbolic.",
    skillTags: ["tone", "word choice"],
    suggestedSeconds: 35,
  },
  {
    id: "eoi-04",
    section: "rw",
    topic: "expression_ideas",
    difficulty: 4,
    stem: "A student is writing a brief for city council. Which sentence least effectively supports a claim that expanding library hours benefits working adults?",
    choices: [
      { id: "A", text: "Survey data show 62% of employed residents cannot visit during current weekday hours." },
      { id: "B", text: "Extended evening hours at peer cities correlated with higher adult visit rates." },
      {
        id: "C",
        text: "The library's rare-book collection includes volumes from the 1700s.",
      },
      {
        id: "D",
        text: "Career workshops held after 6 p.m. filled within two days of registration.",
      },
    ],
    correctChoiceId: "C",
    explanation:
      "Rare books are interesting but do not support the working-adults / hours claim. The others do.",
    skillTags: ["relevance", "support"],
    suggestedSeconds: 80,
  },
];

export function getQuestionById(
  id: string,
  custom: Question[] = [],
): Question | undefined {
  return QUESTIONS.find((q) => q.id === id) ?? custom.find((q) => q.id === id);
}

export function getAllQuestions(custom: Question[] = []): Question[] {
  return [...QUESTIONS, ...custom];
}

export function getQuestionsByTopic(
  topic: string,
  custom: Question[] = [],
): Question[] {
  return getAllQuestions(custom).filter((q) => q.topic === topic);
}

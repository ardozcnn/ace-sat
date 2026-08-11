# AceSAT: An Adaptive SAT Learning Agent for Students Without Tutors

## The problem

Access to high-quality SAT preparation is uneven. Families who can pay for private tutors buy diagnosis, accountability, and a plan that changes when a student stalls. Students in under-resourced schools more often get generic homework packets, occasional practice tests, and well-meaning but time-starved counselors. Digital apps help, but most still behave like **content libraries or chatbots**: the learner must know what to ask or what to click next.

That gap is instructional, not only informational. Improvement on a high-stakes, multi-domain exam requires someone (or something) that:

1. Figures out *where* the student is weak,
2. Chooses the *next* productive struggle,
3. Adjusts when the student flounders or coasts, and
4. Keeps a multi-week path aligned with a real target score.

AceSAT is built around that definition of an **education agent**.

## How the agent works

Ace is not a free-form dialogue model that waits for prompts. It maintains a **student skill state** across eight Digital SAT–aligned domains (Algebra, Advanced Math, Problem Solving & Data, Geometry & Trig, Craft & Structure, Information & Ideas, Standard English Conventions, Expression of Ideas).

**Observe.** Each response becomes an attempt (topic, difficulty, correctness, time). Mastery updates with difficulty weighting; students can lock **Math only**, **Reading only**, or **Auto**. Weakness rankings prefer unfinished skills in a Khan-style order.

**Decide.** Ace chooses diagnose, scaffold, raise difficulty, review a *different* miss, complete a skill mission, rebuild the weekly plan, or **generate a fresh item** when the bank is exhausted — never back-to-back repeats.

**Act.** Practice, Desmos (Math), guided reading steps (passages), study reminders, and coach chat all share one student model. Optional `OPENAI_API_KEY` upgrades procedural generators to full LLM items.

Importantly for schools with limited budgets and connectivity, the **core agent and unlimited procedural questions run without an API key**.

## Impact for underserved schools

If every student had a tireless tutor, early struggle in linear equations would not silently poison later advanced math; reading gaps would be sequenced instead of rediscovered the week before test day. AceSAT aims at that equity opportunity:

- **Autonomy without abandonment:** students without home tutoring still receive a continuous “what should I do in the next 20 minutes?” answer.
- **Teacher force-multiplier:** one educator can review skill maps and agent decisions across many students instead of hand-building every sequence.
- **Motivation with evidence:** projected scores, streak tracking, and visible policy reasons turn vague anxiety into a specific weekly contract.
- **Low adoption friction:** no paid model required for the adaptive loop; open-source code and a local demo path fit classrooms and hackathons alike.

AceSAT will not replace caring adults. It can, however, make expert *tutoring structure* abundant where human expertise is scarce. That is the difference this project is designed to prove: an agent that **owns the next instructional decision**, so talent is not limited by access to someone who already knows what to assign.

# AceSAT

**An adaptive SAT learning agent — not a chatbot.**

Ace diagnoses skill gaps, runs **Khan-style single-skill missions** (no random Math↔Reading jumps), embeds **Desmos** on Math, rebuilds weekly study plans, and decides when to raise difficulty, scaffold down, or advance skills.

![AceSAT concept](https://img.shields.io/badge/agent-adaptive%20SAT%20prep-0d8a72) ![stack](https://img.shields.io/badge/stack-Next.js%20%7C%20TypeScript-122032)

## The problem

Many students in underserved schools want higher SAT scores but lack ongoing, expert coaching. Static practice apps show random questions. Chatbots answer whatever they’re asked. Neither watches performance over time and **takes responsibility for the next instructional move**.

## What AceSAT does

| Agent behavior | How it works |
|---|---|
| **Diagnose** | Math unit first (4 skills), then R&W (4 skills) — never interleaved |
| **Skill missions** | Stay on one topic for ~5 items until proficient (Khan-style) |
| **Desmos** | Graphing calculator on every Math item (Digital SAT tool) |
| **Model mastery** | Bands: Needs practice → Familiar → Proficient → Mastered |
| **Adapt practice** | Difficulty/scaffold inside the skill; section switch is intentional |
| **Plan the week** | One skill per day — never Math + Reading on the same day |
| **Coach** | Same student model answers mission/plan/projection questions |

Policy decisions live in `src/lib/agent.ts` (`decideNext`): `diagnose` · `practice` · `review_missed` · `raise_difficulty` · `lower_difficulty` · `switch_topic` · `update_plan` · `encourage`.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Enter your name, target score, and weekly time.
2. Run the **guided diagnostic**.
3. Watch Ace rebuild a **weekly plan** and steer the next problems.
4. Use **Coach** for plan/projection questions; progress is saved in `localStorage`.

No API key required for the full agent loop — procedural generation creates unlimited fresh items offline. Optional `OPENAI_API_KEY` upgrades item writing quality.

## Project structure

```
src/
  app/                 # Next.js App Router UI
  components/          # Landing, dashboard, practice, plan, coach
  lib/
    agent.ts           # Decision policy + attempt handling
    adaptive.ts        # Question selection
    mastery.ts         # Mastery model & score projection
    plan.ts            # Weekly plan generator
    questions.ts       # Digital SAT–style item bank
    topics.ts          # 8 domains (Math + R&W)
    useStudent.ts      # Client state hook
    storage.ts         # localStorage persistence
docs/
  WRITEUP.md           # One-page problem / system / impact essay
```

## Design principles

- **Agent > chatbot:** every answer triggers a policy decision and usually a next action.
- **Works offline-first:** no paid LLM required for the core loop (equity + classroom demos).
- **Transparent decisions:** UI shows *why* Ace chose the next move.
- **Expandable:** swap in a larger item bank, school roster backend, or LLM explanations without changing the mastery/agent core.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

## Write-up

See [docs/WRITEUP.md](docs/WRITEUP.md) for a one-page description of the problem, agent design, and potential impact for underserved students.

## License

MIT — use it, fork it, improve it for the students who need it most.

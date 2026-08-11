"use client";

import type { AgentDecision, StudentProfile, TopicId } from "@/lib/types";
import { topicLabel, sectionLabel } from "@/lib/topics";
import {
  masteryLevel,
  masteryLevelLabel,
  SECTION_PATH,
  sectionProgress,
} from "@/lib/path";
import clsx from "clsx";

export function Dashboard({
  profile,
  stats,
  decision,
  reminder,
  onPractice,
  onPlan,
  onCoach,
  onChooseSection,
}: {
  profile: StudentProfile;
  stats: {
    projected: number;
    mastery: number;
    weak: TopicId[];
    accuracy: number | null;
  } | null;
  decision: AgentDecision | null;
  reminder?: string | null;
  onPractice: () => void;
  onPlan: () => void;
  onCoach: () => void;
  onChooseSection?: (s: "auto" | "math" | "rw") => void;
}) {
  return (
    <div className="space-y-6 animate-fade-up">
      <section className="rounded-2xl bg-ink-950 px-6 py-7 text-chalk shadow-soft md:px-8">
        <p className="text-xs uppercase tracking-[0.16em] text-signal-light">
          Your tutor
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">
          {profile.diagnosticComplete
            ? profile.focusBlock
              ? `Working on ${topicLabel(profile.focusBlock.topic)}`
              : "You're set up — ready when you are."
            : "A short check-in first, then we practice what matters."}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-300">
          {decision?.message ??
            reminder ??
            profile.messages[profile.messages.length - 1]?.content ??
            "Ready when you are."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onPractice}
            className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-light"
          >
            {profile.diagnosticComplete ? "Practice" : "Begin check-in"}
          </button>
          <button
            onClick={onPlan}
            className="rounded-full border border-ink-600 px-5 py-2.5 text-sm text-ink-100 hover:border-ink-400"
          >
            This week
          </button>
          <button
            onClick={onCoach}
            className="rounded-full border border-ink-600 px-5 py-2.5 text-sm text-ink-100 hover:border-ink-400"
          >
            Ask Ace
          </button>
        </div>
      </section>

      {onChooseSection && (
        <section className="rounded-2xl bg-white/90 p-5 shadow-sm ring-1 ring-ink-200/70">
          <h2 className="font-display text-xl text-ink-950">Choose a focus</h2>
          <p className="mt-1 text-sm text-ink-500">
            Pick Math, Reading & Writing, or both. I'll choose the right skills inside that.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                ["auto", "Both"],
                ["math", "Math"],
                ["rw", "Reading & Writing"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onChooseSection(id)}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm",
                  profile.preferredSection === id
                    ? "bg-ink-950 text-white"
                    : "bg-ink-50 text-ink-700 ring-1 ring-ink-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Estimated score"
          value={stats ? String(stats.projected) : "—"}
          hint={`Goal ${profile.targetScore}`}
        />
        <Stat
          label="Questions answered"
          value={String(profile.attempts.length)}
          hint={
            profile.diagnosticComplete
              ? "Check-in complete"
              : "A few more to finish check-in"
          }
        />
        <Stat
          label="Overall comfort"
          value={stats ? `${Math.round(stats.mastery * 100)}%` : "—"}
          hint="Across SAT skills"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {(["math", "rw"] as const).map((section) => {
          const prog = sectionProgress(profile, section);
          const active = profile.focusBlock?.section === section;
          return (
            <div
              key={section}
              className={clsx(
                "rounded-2xl bg-white/85 p-5 shadow-sm ring-1",
                active ? "ring-signal/50" : "ring-ink-200/70",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-ink-950">
                  {sectionLabel(section)}
                </h2>
                <span className="text-xs text-ink-500">
                  {prog.proficient}/{prog.total} solid
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {SECTION_PATH[section].map((tid) => {
                  const m = profile.mastery[tid];
                  const level = masteryLevel(m);
                  const pct = Math.round(m.mastery * 100);
                  const isFocus = profile.focusBlock?.topic === tid;
                  return (
                    <div key={tid}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span
                          className={clsx(
                            "font-medium",
                            isFocus ? "text-signal-dark" : "text-ink-800",
                          )}
                        >
                          {isFocus ? "→ " : ""}
                          {topicLabel(tid)}
                        </span>
                        <span className="text-ink-500">
                          {masteryLevelLabel(level)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className={clsx(
                            "h-full origin-left rounded-full animate-bar-grow",
                            level === "mastered" || level === "proficient"
                              ? "bg-ink-800"
                              : level === "familiar"
                                ? "bg-signal"
                                : "bg-ember",
                          )}
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {profile.plan && (
        <section className="rounded-2xl border border-dashed border-ink-300 bg-signal-soft/40 p-5">
          <h2 className="font-display text-xl text-ink-950">This week</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">
            {profile.plan.summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.plan.priorities.map((t) => (
              <span
                key={t}
                className="rounded-md bg-white px-2 py-1 text-xs font-medium text-signal-dark ring-1 ring-signal/20"
              >
                {topicLabel(t)}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-ink-200/70">
      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl text-ink-950">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{hint}</p>
    </div>
  );
}

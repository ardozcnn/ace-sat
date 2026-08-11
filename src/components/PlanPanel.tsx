"use client";

import type { StudentProfile } from "@/lib/types";
import { topicLabel, sectionLabel } from "@/lib/topics";
import { sectionOf } from "@/lib/path";
import clsx from "clsx";

export function PlanPanel({
  profile,
  onCompleteDay,
  onRebuild,
}: {
  profile: StudentProfile;
  onCompleteDay: (day: string) => void;
  onRebuild: () => void;
}) {
  const plan = profile.plan;

  if (!plan) {
    return (
      <div className="rounded-2xl bg-white/90 p-8 shadow-sm ring-1 ring-ink-200/70 animate-fade-up">
        <h1 className="font-display text-3xl text-ink-950">Study plan</h1>
        <p className="mt-3 text-sm text-ink-600">
          Complete a short practice check-in first, or generate a plan now if you want a preview.
        </p>
        <button
          onClick={onRebuild}
          className="mt-6 rounded-full bg-ink-950 px-5 py-2.5 text-sm text-white"
        >
          Generate provisional plan now
        </button>
      </div>
    );
  }

  const done = plan.items.filter((i) => i.completed).length;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-ink-200/70 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-signal-dark">
              {plan.weeklyMinutes} minutes / week
            </p>
            <h1 className="mt-1 font-display text-3xl text-ink-950">Study plan</h1>
          </div>
          <button
            onClick={onRebuild}
            className="rounded-full border border-ink-300 px-4 py-2 text-sm text-ink-700 hover:border-ink-500"
          >
            Rebuild from mastery
          </button>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-700">
          {plan.summary}
        </p>
        <p className="mt-3 text-xs text-ink-500">
          {done}/{plan.items.length} days marked complete · priorities:{" "}
          {plan.priorities.map(topicLabel).join(", ")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {plan.items.map((item) => (
          <div
            key={item.day}
            className={clsx(
              "rounded-2xl p-4 ring-1",
              item.completed
                ? "bg-signal-soft/60 ring-signal/25"
                : "bg-white/90 ring-ink-200/70",
            )}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink-950">{item.day}</h2>
              <span className="font-mono text-xs text-ink-500">{item.minutes} min</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded bg-signal-soft px-1.5 py-0.5 text-[11px] text-signal-dark">
                {sectionLabel(item.section ?? sectionOf(item.focus[0]))}
              </span>
              {item.focus.slice(0, 1).map((t) => (
                <span
                  key={t}
                  className="rounded bg-ink-50 px-1.5 py-0.5 text-[11px] text-ink-700"
                >
                  {topicLabel(t)}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.goal}</p>
            <button
              onClick={() => onCompleteDay(item.day)}
              disabled={item.completed}
              className="mt-3 text-xs font-medium text-signal-dark disabled:text-ink-400"
            >
              {item.completed ? "Completed" : "Mark complete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

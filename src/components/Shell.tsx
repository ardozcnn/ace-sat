"use client";

import type { StudentProfile, TopicId } from "@/lib/types";
import { topicLabel, sectionLabel } from "@/lib/topics";
import clsx from "clsx";

type Tab = "home" | "practice" | "plan" | "coach";

export function Shell({
  profile,
  stats,
  tab,
  onTab,
  onReset,
  reminder,
  onDismissReminder,
  studyMode,
  onChooseSection,
  children,
}: {
  profile: StudentProfile;
  stats: {
    projected: number;
    mastery: number;
    weak: TopicId[];
    accuracy: number | null;
  } | null;
  tab: Tab;
  onTab: (t: Tab) => void;
  onReset: () => void;
  reminder?: string | null;
  onDismissReminder?: () => void;
  studyMode?: "auto" | "math" | "rw";
  onChooseSection?: (s: "auto" | "math" | "rw") => void;
  children: React.ReactNode;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "practice", label: "Practice" },
    { id: "plan", label: "Plan" },
    { id: "coach", label: "Coach" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,#e8f5f1_0%,transparent_40%),linear-gradient(180deg,#f4f8fb,#eef3f7)]">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        {reminder && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ember-soft px-4 py-3 text-sm text-ink-900 ring-1 ring-ember/20">
            <p>{reminder}</p>
            <button
              type="button"
              onClick={onDismissReminder}
              className="text-xs font-medium text-ember underline-offset-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-200/70 pb-5">
          <div>
            <span className="font-display text-3xl font-semibold text-ink-950">
              AceSAT
            </span>
            <p className="mt-1 text-sm text-ink-600">
              Hi, {profile.name}
              {stats && (
                <>
                  {" "}
                  · estimated score{" "}
                  <span className="font-medium text-ink-900">{stats.projected}</span>
                  <span className="text-ink-400"> / {profile.targetScore}</span>
                </>
              )}
            </p>
          </div>
          <nav className="flex flex-wrap gap-1 rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-ink-200/60">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                className={clsx(
                  "rounded-full px-3.5 py-1.5 text-sm transition",
                  tab === t.id
                    ? "bg-ink-950 text-white"
                    : "text-ink-600 hover:text-ink-950",
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="h-fit space-y-4">
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-ink-200/70">
              <p className="text-xs font-medium text-ink-400">Your progress</p>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-ink-500">Comfort</dt>
                  <dd className="font-display text-2xl text-ink-950">
                    {stats ? `${Math.round(stats.mastery * 100)}%` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-500">Accuracy</dt>
                  <dd className="text-ink-900">
                    {stats?.accuracy != null
                      ? `${Math.round(stats.accuracy * 100)}%`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-500">Day streak</dt>
                  <dd className="text-ink-900">{profile.streakDays}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Needs work</dt>
                  <dd className="mt-1 space-y-1">
                    {(stats?.weak ?? []).slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="mr-1 inline-block rounded-md bg-ember-soft px-1.5 py-0.5 text-xs text-ember"
                      >
                        {topicLabel(t)}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            {onChooseSection && (
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-ink-200/70">
                <p className="text-xs font-medium text-ink-400">Study focus</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {(
                    [
                      ["auto", "Both sections"],
                      ["math", "Math"],
                      ["rw", "Reading & Writing"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onChooseSection(id)}
                      className={clsx(
                        "rounded-lg px-3 py-2 text-left text-xs transition",
                        studyMode === id
                          ? "bg-ink-950 text-white"
                          : "bg-ink-50 text-ink-700 hover:bg-ink-100",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {profile.focusBlock && (
                  <p className="mt-3 text-[11px] leading-relaxed text-ink-500">
                    Now: {topicLabel(profile.focusBlock.topic)} (
                    {sectionLabel(profile.focusBlock.section)})
                  </p>
                )}
              </div>
            )}

            <button
              onClick={onReset}
              className="text-xs text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline"
            >
              Start over
            </button>
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

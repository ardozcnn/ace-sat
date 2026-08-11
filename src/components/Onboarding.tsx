"use client";

import { useState } from "react";

export function Onboarding({
  onComplete,
  onClose,
}: {
  onComplete: (data: {
    name: string;
    targetScore: number;
    weeklyMinutes: number;
    testDate: string | null;
  }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [targetScore, setTargetScore] = useState(1200);
  const [weeklyMinutes, setWeeklyMinutes] = useState(210);
  const [testDate, setTestDate] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/45 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-labelledby="onboard-title"
        className="w-full max-w-md rounded-2xl bg-chalk p-6 shadow-soft animate-fade-up md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-signal-dark">Welcome</p>
            <h2 id="onboard-title" className="mt-1 font-display text-3xl text-ink-950">
              Set your goal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-sm text-ink-500 hover:text-ink-800"
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          Tell us your name and score goal. Then we&apos;ll start with a short check-in.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onComplete({
              name,
              targetScore,
              weeklyMinutes,
              testDate: testDate || null,
            });
          }}
        >
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Your name
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-950 outline-none ring-signal/30 focus:ring-2"
              placeholder="e.g. Jordan"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Target score ({targetScore})
            </span>
            <input
              type="range"
              min={800}
              max={1600}
              step={10}
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="mt-3 w-full accent-signal"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Weekly study minutes ({weeklyMinutes})
            </span>
            <input
              type="range"
              min={90}
              max={600}
              step={15}
              value={weeklyMinutes}
              onChange={(e) => setWeeklyMinutes(Number(e.target.value))}
              className="mt-3 w-full accent-signal"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Test date (optional)
            </span>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-950 outline-none ring-signal/30 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-ink-950 py-3 text-sm font-medium text-white transition hover:bg-ink-800"
          >
            Create my profile
          </button>
        </form>
      </div>
    </div>
  );
}

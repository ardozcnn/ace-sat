"use client";

import { useEffect, useState } from "react";
import type { AgentDecision, Question, StudentProfile } from "@/lib/types";
import { topicLabel, sectionLabel } from "@/lib/topics";
import { masteryLevel, masteryLevelLabel } from "@/lib/path";
import { actionLabel } from "@/lib/copy";
import { DesmosPanel } from "@/components/DesmosPanel";
import clsx from "clsx";

export function PracticePanel({
  profile,
  question,
  decision,
  phase,
  lastResult,
  loadingNext,
  scaffoldTip,
  onStart,
  onSubmit,
  onContinue,
  onChooseSection,
}: {
  profile: StudentProfile;
  question: Question | null;
  decision: AgentDecision | null;
  phase: "idle" | "question" | "feedback";
  lastResult: { correct: boolean; explanation: string } | null;
  loadingNext?: boolean;
  scaffoldTip?: string | null;
  onStart: () => void;
  onSubmit: (choiceId: string) => void;
  onContinue: () => void;
  onChooseSection: (s: "auto" | "math" | "rw") => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [readingStep, setReadingStep] = useState(0);
  const block = profile.focusBlock;
  const level = block
    ? masteryLevelLabel(masteryLevel(profile.mastery[block.topic]))
    : null;

  useEffect(() => {
    setSelected(null);
    setReadingStep(0);
  }, [question?.id]);

  const modes: { id: "auto" | "math" | "rw"; label: string }[] = [
    { id: "auto", label: "Both" },
    { id: "math", label: "Math" },
    { id: "rw", label: "Reading & Writing" },
  ];

  const sectionPicker = (
    <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-ink-200/70">
      <p className="text-xs font-medium text-ink-500">What do you want to study?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChooseSection(m.id)}
            className={clsx(
              "rounded-full px-4 py-2 text-sm transition",
              profile.preferredSection === m.id
                ? "bg-ink-950 text-white"
                : "bg-ink-50 text-ink-700 ring-1 ring-ink-200 hover:bg-ink-100",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (phase === "idle" || !question) {
    return (
      <div className="space-y-4 animate-fade-up">
        {sectionPicker}
        <div className="rounded-2xl bg-white/90 p-8 shadow-sm ring-1 ring-ink-200/70">
          <h1 className="font-display text-3xl text-ink-950">
            {profile.diagnosticComplete
              ? block
                ? `Continue with ${topicLabel(block.topic)}`
                : "Continue practice"
              : "Let's see where you stand"}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-600">
            {profile.diagnosticComplete
              ? "I'll keep picking practice that matches how you're doing."
              : "A few short questions first so I know what to work on with you."}
          </p>
          {block && profile.diagnosticComplete && (
            <div className="mt-4 rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-700">
              {sectionLabel(block.section)} · {topicLabel(block.topic)} ·{" "}
              {block.answeredInBlock} of {block.targetCount}
              {level ? ` · ${level}` : ""}
            </div>
          )}
          <button
            disabled={loadingNext}
            onClick={onStart}
            className="mt-6 rounded-full bg-ink-950 px-6 py-3 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-50"
          >
            {loadingNext
              ? "One moment…"
              : profile.diagnosticComplete
                ? "Start practice"
                : "Begin"}
          </button>
        </div>
      </div>
    );
  }

  const needsReadingGate =
    Boolean(question.passage) &&
    question.section === "rw" &&
    phase === "question" &&
    readingStep < 2;

  const missionPct = block
    ? Math.min(
        100,
        Math.round((block.answeredInBlock / Math.max(1, block.targetCount)) * 100),
      )
    : 0;

  return (
    <div className="space-y-4 animate-fade-up">
      {sectionPicker}

      {block && (
        <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-ink-200/70">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-ink-900">
              {topicLabel(block.topic)}
            </span>
            <span className="text-ink-500">
              {block.answeredInBlock} of {block.targetCount}
              {level ? ` · ${level}` : ""}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-signal transition-all duration-500"
              style={{ width: `${missionPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md bg-ink-950 px-2.5 py-1 text-white">
          {actionLabel(decision?.action)}
        </span>
        <span className="rounded-md bg-white px-2 py-1 ring-1 ring-ink-200 text-ink-600">
          {sectionLabel(question.section)}
        </span>
      </div>

      {(scaffoldTip || decision?.message) && (
        <p className="rounded-xl bg-signal-soft/60 px-4 py-3 text-sm text-ink-800">
          {scaffoldTip || decision?.message}
        </p>
      )}

      <div
        className={clsx(
          "grid gap-4",
          question.section === "math" &&
            "lg:grid-cols-[1fr_minmax(280px,0.95fr)]",
        )}
      >
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink-200/80 md:p-8">
          {question.passage && (
            <div className="mb-5 space-y-3">
              <div className="rounded-xl bg-chalk px-4 py-3 text-sm leading-relaxed text-ink-800">
                {question.passage}
              </div>
              {phase === "question" && (
                <div className="flex flex-wrap gap-2 text-xs text-ink-500">
                  <span className={readingStep >= 1 ? "text-signal-dark font-medium" : ""}>
                    1. Read
                  </span>
                  <span>·</span>
                  <span className={readingStep >= 2 ? "text-signal-dark font-medium" : ""}>
                    2. Think
                  </span>
                  <span>·</span>
                  <span
                    className={
                      readingStep >= 2 && selected ? "text-signal-dark font-medium" : ""
                    }
                  >
                    3. Answer
                  </span>
                </div>
              )}
            </div>
          )}

          {!needsReadingGate && (
            <>
              <h2 className="whitespace-pre-wrap text-lg font-medium leading-relaxed text-ink-950 md:text-xl">
                {question.stem}
              </h2>

              <div className="mt-6 space-y-2">
                {question.choices.map((c) => {
                  const isSel = selected === c.id;
                  const showKey =
                    phase === "feedback" && c.id === question.correctChoiceId;
                  const showWrong =
                    phase === "feedback" &&
                    isSel &&
                    c.id !== question.correctChoiceId;
                  return (
                    <button
                      key={c.id}
                      disabled={phase === "feedback"}
                      onClick={() => setSelected(c.id)}
                      className={clsx(
                        "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                        phase === "feedback" &&
                          showKey &&
                          "border-signal bg-signal-soft",
                        phase === "feedback" &&
                          showWrong &&
                          "border-ember bg-ember-soft",
                        phase !== "feedback" &&
                          isSel &&
                          "border-ink-950 bg-ink-50 ring-1 ring-ink-950",
                        phase !== "feedback" &&
                          !isSel &&
                          "border-ink-200 bg-white hover:border-ink-400",
                      )}
                    >
                      <span className="font-mono text-xs text-ink-400">{c.id}</span>
                      <span className="text-ink-900">{c.text}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {needsReadingGate && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl text-ink-950">
                {readingStep === 0 ? "Read the passage" : "Before you answer"}
              </h2>
              <p className="text-sm leading-relaxed text-ink-600">
                {readingStep === 0
                  ? "Take your time with the text. When you're ready, continue."
                  : "What is the main idea? Which detail supports it? Then go to the question."}
              </p>
              <button
                type="button"
                onClick={() => setReadingStep((s) => s + 1)}
                className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-white"
              >
                {readingStep === 0 ? "I've read it" : "Show the question"}
              </button>
            </div>
          )}

          {phase === "question" && !needsReadingGate && (
            <button
              disabled={!selected}
              onClick={() => selected && onSubmit(selected)}
              className="mt-6 rounded-full bg-signal px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40"
            >
              Check answer
            </button>
          )}

          {phase === "feedback" && lastResult && (
            <div className="mt-6 space-y-4 border-t border-ink-100 pt-5">
              <p
                className={clsx(
                  "font-display text-2xl",
                  lastResult.correct ? "text-signal-dark" : "text-ember",
                )}
              >
                {lastResult.correct ? "Correct" : "Not quite"}
              </p>
              <p className="text-sm leading-relaxed text-ink-700">
                {lastResult.explanation}
              </p>
              {decision?.message && (
                <p className="rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-700">
                  {decision.message}
                </p>
              )}
              <button
                disabled={loadingNext}
                onClick={onContinue}
                className="rounded-full bg-ink-950 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {loadingNext ? "Loading…" : "Next question"}
              </button>
            </div>
          )}
        </article>

        {question.section === "math" && (
          <DesmosPanel latex={question.desmosLatex ?? []} openDefault />
        )}
      </div>
    </div>
  );
}

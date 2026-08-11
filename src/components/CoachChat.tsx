"use client";

import { useEffect, useRef, useState } from "react";
import type { StudentProfile } from "@/lib/types";
import clsx from "clsx";

export function CoachChat({
  profile,
  onSend,
}: {
  profile: StudentProfile;
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [profile.messages.length]);

  return (
    <div className="flex h-[min(70vh,720px)] flex-col rounded-2xl bg-white/90 shadow-sm ring-1 ring-ink-200/70 animate-fade-up">
      <div className="border-b border-ink-100 px-5 py-4">
        <h1 className="font-display text-2xl text-ink-950">Coach</h1>
        <p className="mt-1 text-sm text-ink-500">
          Ask about your plan, your progress, or what to practice next.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {profile.messages.map((m) => (
          <div
            key={m.id}
            className={clsx(
              "max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              m.role === "student"
                ? "ml-auto bg-ink-950 text-white"
                : m.role === "agent"
                  ? "bg-ink-50 text-ink-800"
                  : "bg-transparent text-ink-400",
            )}
          >
            {m.role === "agent" && m.meta?.action && (
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-signal-dark">
                Ace
              </span>
            )}
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex gap-2 border-t border-ink-100 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          onSend(draft);
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about your plan or progress…"
          className="flex-1 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none ring-signal/25 focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-white hover:bg-signal-dark"
        >
          Send
        </button>
      </form>
    </div>
  );
}

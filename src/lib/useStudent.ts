"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  agentChatReply,
  applyAttempt,
  createStudent,
  dismissReminder,
  getStudyReminder,
  setPreferredSection,
  startGuidedQuestion,
} from "./agent";
import { generateStudyPlan, markPlanDayComplete } from "./plan";
import { clearProfile, loadProfile, saveProfile } from "./storage";
import type {
  AgentDecision,
  Question,
  StudentProfile,
} from "./types";
import {
  overallMastery,
  projectedScore,
  rankedWeakTopics,
} from "./mastery";
import { topicLabel } from "./topics";

export function useStudent() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [decision, setDecision] = useState<AgentDecision | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number | null>(
    null,
  );
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);
  const [phase, setPhase] = useState<"idle" | "question" | "feedback">("idle");
  const [loadingNext, setLoadingNext] = useState(false);
  const [pendingNext, setPendingNext] = useState<Question | null>(null);
  const [scaffoldTip, setScaffoldTip] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadProfile();
    setProfile(existing);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (profile) saveProfile(profile);
  }, [profile]);

  const onboard = useCallback(
    (input: {
      name: string;
      targetScore: number;
      weeklyMinutes: number;
      testDate: string | null;
    }) => {
      const student = createStudent(input);
      setProfile(student);
      setPhase("idle");
      setQuestion(null);
      setDecision(null);
      setLastResult(null);
      setScaffoldTip(null);
    },
    [],
  );

  const reset = useCallback(() => {
    clearProfile();
    setProfile(null);
    setQuestion(null);
    setDecision(null);
    setLastResult(null);
    setPhase("idle");
    setScaffoldTip(null);
  }, []);

  /** Optionally enrich with OpenAI, else keep local generated */
  const maybeEnrichWithAi = useCallback(async (q: Question, p: StudentProfile) => {
    if (q.source === "openai") return { question: q, profile: p };
    // Enrich only generated placeholders when API available and student wants more novelty
    if (q.source !== "generated") return { question: q, profile: p };
    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: q.topic,
          difficulty: q.difficulty,
          weakHint: topicLabel(q.topic),
        }),
      });
      if (!res.ok) return { question: q, profile: p };
      const data = (await res.json()) as { question?: Question; source?: string };
      if (!data.question || data.source === "local-generator") {
        return { question: q, profile: p };
      }
      const aiQ = data.question;
      const customQuestions = [...(p.customQuestions ?? []), aiQ].slice(-200);
      return {
        question: aiQ,
        profile: { ...p, customQuestions },
      };
    } catch {
      return { question: q, profile: p };
    }
  }, []);

  const startSession = useCallback(async () => {
    if (!profile) return;
    setLoadingNext(true);
    try {
      let { profile: next, decision: d, question: q } = startGuidedQuestion(profile);
      if (q) {
        const enriched = await maybeEnrichWithAi(q, next);
        next = enriched.profile;
        q = enriched.question;
        d = { ...d, questionId: q.id };
      }
      setProfile(next);
      setDecision(d);
      setQuestion(q);
      setQuestionStartedAt(Date.now());
      setLastResult(null);
      setPhase(q ? "question" : "idle");
      setScaffoldTip(
        d.action === "scaffold_lesson" || d.action === "reading_guide"
          ? d.message
          : null,
      );
    } finally {
      setLoadingNext(false);
    }
  }, [profile, maybeEnrichWithAi]);

  const submitAnswer = useCallback(
    (selectedChoiceId: string) => {
      if (!profile || !question || !questionStartedAt) return;
      const timeMs = Date.now() - questionStartedAt;
      const result = applyAttempt(profile, {
        questionId: question.id,
        selectedChoiceId,
        timeMs,
      });
      setProfile(result.profile);
      setLastResult({
        correct: result.correct,
        explanation: result.explanation,
      });
      setDecision(result.decision);
      setPendingNext(
        result.question && result.question.id !== question.id
          ? result.question
          : null,
      );
      setPhase("feedback");
      setScaffoldTip(
        result.decision.action === "scaffold_lesson"
          ? result.decision.message
          : null,
      );
    },
    [profile, question, questionStartedAt],
  );

  const continueAfterFeedback = useCallback(async () => {
    if (!profile) {
      await startSession();
      return;
    }
    setLoadingNext(true);
    try {
      const lastId = profile.attempts[profile.attempts.length - 1]?.questionId;
      let next = profile;
      let q = pendingNext;
      let d = decision;

      if (!q || (lastId && q.id === lastId)) {
        const decided = startGuidedQuestion(profile);
        next = decided.profile;
        q = decided.question;
        d = decided.decision;
      }

      if (q && lastId && q.id === lastId) {
        const retry = startGuidedQuestion({
          ...next,
          seenQuestionIds: Array.from(
            new Set([...next.seenQuestionIds, lastId]),
          ),
          customQuestions: next.customQuestions,
        });
        next = retry.profile;
        q = retry.question;
        d = retry.decision;
      }

      if (q) {
        const enriched = await maybeEnrichWithAi(q, next);
        next = enriched.profile;
        q = enriched.question;
        if (d) d = { ...d, questionId: q.id };
      }

      setProfile(next);
      setDecision(d);
      setQuestion(q);
      setPendingNext(null);
      setQuestionStartedAt(Date.now());
      setLastResult(null);
      setPhase(q ? "question" : "idle");
      setScaffoldTip(
        d?.action === "scaffold_lesson" || d?.action === "reading_guide"
          ? d.message
          : null,
      );
    } finally {
      setLoadingNext(false);
    }
  }, [profile, decision, pendingNext, startSession, maybeEnrichWithAi]);

  const sendChat = useCallback(
    (text: string) => {
      if (!profile || !text.trim()) return;
      const { profile: next } = agentChatReply(profile, text.trim());
      setProfile(next);
    },
    [profile],
  );

  const completePlanDay = useCallback(
    (day: string) => {
      if (!profile?.plan) return;
      setProfile({
        ...profile,
        plan: markPlanDayComplete(profile.plan, day),
      });
    },
    [profile],
  );

  const rebuildPlan = useCallback(() => {
    if (!profile) return;
    setProfile({ ...profile, plan: generateStudyPlan(profile) });
  }, [profile]);

  const chooseSection = useCallback(
    (section: "auto" | "math" | "rw") => {
      if (!profile) return;
      const next = setPreferredSection(profile, section);
      setProfile(next);
      setPhase("idle");
      setQuestion(null);
      setLastResult(null);
    },
    [profile],
  );

  const dismissStudyReminder = useCallback(() => {
    if (!profile) return;
    setProfile(dismissReminder(profile));
  }, [profile]);

  const reminder = useMemo(
    () => (profile ? getStudyReminder(profile) : null),
    [profile],
  );

  const stats = useMemo(() => {
    if (!profile) return null;
    return {
      projected: projectedScore(profile),
      mastery: overallMastery(profile),
      weak: rankedWeakTopics(profile, 4),
      accuracy:
        profile.attempts.length === 0
          ? null
          : profile.attempts.filter((a) => a.correct).length /
            profile.attempts.length,
    };
  }, [profile]);

  return {
    profile,
    hydrated,
    question,
    decision,
    phase,
    lastResult,
    stats,
    loadingNext,
    scaffoldTip,
    reminder,
    onboard,
    reset,
    startSession,
    submitAnswer,
    continueAfterFeedback,
    sendChat,
    completePlanDay,
    rebuildPlan,
    chooseSection,
    dismissStudyReminder,
  };
}

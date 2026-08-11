"use client";

import { useStudent } from "@/lib/useStudent";
import { Onboarding } from "@/components/Onboarding";
import { Shell } from "@/components/Shell";
import { Dashboard } from "@/components/Dashboard";
import { PracticePanel } from "@/components/PracticePanel";
import { PlanPanel } from "@/components/PlanPanel";
import { CoachChat } from "@/components/CoachChat";
import { Landing } from "@/components/Landing";
import { useState } from "react";

export default function HomePage() {
  const student = useStudent();
  const [tab, setTab] = useState<"home" | "practice" | "plan" | "coach">("home");
  const [showOnboard, setShowOnboard] = useState(false);

  if (!student.hydrated) {
    return (
      <div className="min-h-screen grid place-items-center bg-ink-50">
        <p className="font-mono text-sm text-ink-500 animate-pulse-soft">
          Loading AceSAT…
        </p>
      </div>
    );
  }

  if (!student.profile) {
    return (
      <>
        <Landing onStart={() => setShowOnboard(true)} />
        {showOnboard && (
          <Onboarding
            onComplete={(data) => {
              student.onboard(data);
              setShowOnboard(false);
              setTab("practice");
            }}
            onClose={() => setShowOnboard(false)}
          />
        )}
      </>
    );
  }

  return (
    <Shell
      profile={student.profile}
      stats={student.stats}
      tab={tab}
      onTab={setTab}
      onReset={student.reset}
      reminder={student.reminder}
      onDismissReminder={student.dismissStudyReminder}
      studyMode={student.profile.preferredSection}
      onChooseSection={student.chooseSection}
    >
      {tab === "home" && (
        <Dashboard
          profile={student.profile}
          stats={student.stats}
          decision={student.decision}
          reminder={student.reminder}
          onPractice={() => {
            setTab("practice");
            void student.startSession();
          }}
          onPlan={() => setTab("plan")}
          onCoach={() => setTab("coach")}
          onChooseSection={student.chooseSection}
        />
      )}
      {tab === "practice" && (
        <PracticePanel
          profile={student.profile}
          question={student.question}
          decision={student.decision}
          phase={student.phase}
          lastResult={student.lastResult}
          loadingNext={student.loadingNext}
          scaffoldTip={student.scaffoldTip}
          onStart={() => void student.startSession()}
          onSubmit={student.submitAnswer}
          onContinue={() => void student.continueAfterFeedback()}
          onChooseSection={student.chooseSection}
        />
      )}
      {tab === "plan" && (
        <PlanPanel
          profile={student.profile}
          onCompleteDay={student.completePlanDay}
          onRebuild={student.rebuildPlan}
        />
      )}
      {tab === "coach" && (
        <CoachChat profile={student.profile} onSend={student.sendChat} />
      )}
    </Shell>
  );
}

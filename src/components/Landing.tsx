"use client";

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,#d8f5ee_0%,transparent_50%),radial-gradient(ellipse_at_90%_10%,#fceee4_0%,transparent_42%),linear-gradient(180deg,#f4f8fb_0%,#e8f0f5_55%,#dce8f0_100%)]" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #0b1520 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="absolute -right-24 top-24 h-[420px] w-[420px] rounded-full border border-ink-200/80 animate-pulse-soft" />
      <div className="absolute -right-8 top-40 h-[300px] w-[300px] rounded-full border border-signal/30" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-8 md:px-10">
        <header className="flex items-center justify-between animate-fade-up">
          <span className="font-display text-3xl font-semibold tracking-tight text-ink-950 md:text-4xl">
            AceSAT
          </span>
          <button
            onClick={onStart}
            className="rounded-full bg-ink-950 px-5 py-2.5 text-sm font-medium text-chalk transition hover:bg-ink-800"
          >
            Get started
          </button>
        </header>

        <main className="mt-16 flex flex-1 flex-col justify-center md:mt-20 md:max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-signal-dark animate-fade-up">
            SAT practice that adapts to you
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,4.75rem)] leading-[0.95] tracking-tight text-ink-950 text-balance animate-fade-up-delay">
            AceSAT
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600 animate-fade-up-delay-2">
            A patient tutor that finds your weak spots, chooses good practice, builds a
            simple weekly plan, and stays with you until things click.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up-delay-2">
            <button
              onClick={onStart}
              className="rounded-full bg-signal px-7 py-3.5 text-base font-medium text-white shadow-lift transition hover:bg-signal-dark"
            >
              Start free check-in
            </button>
            <a
              href="#how"
              className="text-sm font-medium text-ink-700 underline-offset-4 hover:underline"
            >
              How it works
            </a>
          </div>
        </main>

        <section
          id="how"
          className="mt-10 grid gap-6 border-t border-ink-200/80 pt-10 md:grid-cols-3"
        >
          {[
            {
              title: "See where you are",
              body: "A few questions show which Math and Reading skills need the most attention.",
            },
            {
              title: "Practice what counts",
              body: "You'll stay on one skill until it improves — with harder or easier questions as needed.",
            },
            {
              title: "Stay on track",
              body: "A weekly plan and gentle reminders keep progress moving between sessions.",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className="animate-fade-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <p className="text-xs uppercase tracking-[0.16em] text-ember">
                0{i + 1}
              </p>
              <h2 className="mt-2 font-display text-2xl text-ink-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        el: HTMLElement,
        options?: Record<string, unknown>,
      ) => {
        setExpression: (expr: { id: string; latex: string }) => void;
        setBlank: () => void;
        destroy: () => void;
      };
    };
  }
}

/** Public Desmos API demo key (documented by Desmos for embeds). */
const DESMOS_API_KEY = "dcb31709b452b1cf9dc26972add0fda6";
const DESMOS_SCRIPT = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${DESMOS_API_KEY}`;

let scriptPromise: Promise<void> | null = null;

function loadDesmos(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Desmos) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-desmos="1"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
      return;
    }
    const s = document.createElement("script");
    s.src = DESMOS_SCRIPT;
    s.async = true;
    s.dataset.desmos = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Desmos failed to load"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function DesmosPanel({
  latex = [],
  openDefault = true,
}: {
  latex?: string[];
  openDefault?: boolean;
}) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<ReturnType<
    NonNullable<typeof window.Desmos>["GraphingCalculator"]
  > | null>(null);
  const [open, setOpen] = useState(openDefault);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );

  useEffect(() => {
    if (!open) {
      if (calcRef.current) {
        calcRef.current.destroy();
        calcRef.current = null;
      }
      return;
    }

    let cancelled = false;
    setStatus("loading");

    loadDesmos()
      .then(() => {
        if (cancelled || !containerRef.current || !window.Desmos) return;
        containerRef.current.innerHTML = "";
        const calculator = window.Desmos.GraphingCalculator(
          containerRef.current,
          {
            keypad: true,
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
            expressionsTopbar: true,
            border: false,
          },
        );
        calcRef.current = calculator;
        latex.forEach((expr, i) => {
          calculator.setExpression({ id: `ex-${reactId}-${i}`, latex: expr });
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      if (calcRef.current) {
        calcRef.current.destroy();
        calcRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reactId]);

  useEffect(() => {
    if (!calcRef.current || status !== "ready") return;
    calcRef.current.setBlank();
    latex.forEach((expr, i) => {
      calcRef.current?.setExpression({
        id: `ex-${reactId}-${i}`,
        latex: expr,
      });
    });
  }, [latex, reactId, status]);

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-ink-200/80 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-ink-50/80"
      >
        <div>
          <p className="text-xs font-medium text-ink-500">Calculator</p>
          <p className="text-sm font-medium text-ink-900">Graphing calculator</p>
        </div>
        <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs text-ink-600">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && (
        <div className="border-t border-ink-100 px-2 pb-2">
          {status === "loading" && (
            <p className="px-2 py-6 text-center text-sm text-ink-500 animate-pulse-soft">
              Loading Desmos…
            </p>
          )}
          {status === "error" && (
            <div className="space-y-2 px-3 py-4 text-sm text-ink-600">
              <p>Desmos script could not load (network/firewall).</p>
              <a
                href="https://www.desmos.com/calculator"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-signal-dark underline"
              >
                Open Desmos in a new tab
              </a>
            </div>
          )}
          <div
            ref={containerRef}
            className="h-[320px] w-full overflow-hidden rounded-xl md:h-[380px]"
            style={{ display: status === "ready" ? "block" : "none" }}
          />
          <p className="px-2 pb-2 pt-1 text-[10px] text-ink-400">
            Graph functions, zoom, and check your work
          </p>
        </div>
      )}
    </div>
  );
}

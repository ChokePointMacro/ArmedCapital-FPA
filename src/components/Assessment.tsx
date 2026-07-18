"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import {
  QUESTIONS,
  MAX_SCORE,
  GRADED_IDS,
  gradeFrom,
  recommend,
  type Fit,
  type AssessmentOption,
  type Recommendation,
} from "@/lib/assessment";
import { submitAssessment } from "@/app/actions/leads";
import { track } from "@/lib/analytics";
import { ButtonLink } from "@/components/Button";
import { BookingButton } from "@/components/Booking";

export function Assessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [fits, setFits] = useState<Record<string, Fit>>({});
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [saved, setSaved] = useState<"idle" | "saving" | "ok">("idle");
  const [pending, setPending] = useState<AssessmentOption | null>(null);
  const [detail, setDetail] = useState("");

  const total = QUESTIONS.length;
  const done = step >= total;
  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const gradeOf = (f: Record<string, Fit>) =>
    gradeFrom(GRADED_IDS.map((id) => f[id]).filter(Boolean) as Fit[]);
  const pct = Math.round((score / MAX_SCORE) * 100);
  const rec: Recommendation = recommend(pct);

  /** Options carrying `capture` pause for a short free-text answer first. */
  function pick(o: AssessmentOption) {
    if (o.capture) {
      setPending(o);
      setDetail("");
      return;
    }
    commit(o);
  }

  function commit(o: AssessmentOption, detailText?: string) {
    const points = o.points ?? 0;
    const fit = o.fit;
    const extra = detailText?.trim().slice(0, 80);
    const label = extra ? `${o.label}: ${extra}` : o.label;
    setPending(null);
    setDetail("");
    const q = QUESTIONS[step];
    setAnswers((p) => ({ ...p, [q.id]: points }));
    setLabels((p) => ({ ...p, [q.id]: label }));
    const nextFits = fit ? { ...fits, [q.id]: fit } : fits;
    if (fit) setFits(nextFits);
    const next = step + 1;
    setStep(next);
    if (next >= total) {
      const finalScore = Math.round(
        ((score + points) / MAX_SCORE) * 100,
      );
      const grade = gradeOf(nextFits);
      track("assessment_completed", { score: finalScore, grade });
      // Persist anonymously up front; email (if given) is added on the result.
      void submitAssessment({
        email: "",
        score: finalScore,
        answers: { ...labels, [q.id]: label, _grade: grade },
        recommended_next_step: recommend(finalScore).headline,
        website_hp: "",
      });
    }
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    setSaved("saving");
    const res = await submitAssessment({
      email,
      score: pct,
      answers: { ...labels, _grade: gradeOf(fits) },
      recommended_next_step: rec.headline,
      website_hp: hp,
    });
    setSaved(res.ok ? "ok" : "idle");
  }

  if (!done) {
    const q = QUESTIONS[step];
    return (
      <div className="glass rounded-xl p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-hair">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${(step / total) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted">
            {step + 1}/{total}
          </span>
        </div>

        <h3 className="font-mono text-lg font-semibold text-fg">{q.prompt}</h3>
        {q.help && (
          <p className="mt-1.5 font-mono text-xs text-muted">{q.help}</p>
        )}

        {pending ? (
          <div className="mt-5 flex flex-col gap-3">
            <label
              htmlFor="assessment-detail"
              className="font-mono text-sm text-fg"
            >
              {pending.capture}
            </label>
            <input
              id="assessment-detail"
              autoFocus
              value={detail}
              maxLength={80}
              onChange={(e) => setDetail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commit(pending, detail);
                }
              }}
              placeholder="e.g. Cin7, Katana, Odoo, SAP Business One, Fishbowl…"
              className="rounded-lg border border-border-hair bg-bg/40 px-4 py-3.5 text-sm text-fg outline-none transition-colors placeholder:text-muted/60 focus:border-accent/55"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => commit(pending, detail)}
                className="rounded-md bg-accent px-4 py-2 font-mono text-sm text-on-accent transition-all hover:brightness-110"
              >
                Continue
              </button>
              <button
                onClick={() => commit(pending)}
                className="rounded-md px-3 py-2 font-mono text-sm text-muted transition-colors hover:text-fg"
              >
                Skip
              </button>
            </div>
            <p className="font-mono text-[11px] text-muted">
              Optional — it just helps us see which systems to support next.
            </p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2.5">
            {q.options.map((o) => (
              <button
                key={o.label}
                onClick={() => pick(o)}
                className="group flex items-center justify-between rounded-lg border border-border-hair bg-bg/40 px-4 py-3.5 text-left text-sm text-fg/90 transition-all hover:border-accent/55 hover:bg-accent/5"
              >
                <span>{o.label}</span>
                <span className="font-mono text-xs text-muted group-hover:text-accent">
                  →
                </span>
              </button>
            ))}
          </div>
        )}

        {step > 0 && (
          <button
            onClick={() => { setPending(null); setStep((s) => s - 1); }}
            className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-border-hair)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute flex flex-col">
            <span className="font-mono text-3xl font-bold text-accent">{pct}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              readiness
            </span>
          </div>
        </div>

        <h3 className="mt-5 font-mono text-xl font-semibold text-fg">
          {rec.headline}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          {rec.body}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {rec.cta === "book" ? (
            <BookingButton label="Book a call" variant="primary" />
          ) : (
            <ButtonLink href="/services#icp" variant="primary">
              Explore Stage 1
            </ButtonLink>
          )}
          <ButtonLink href="/contact" variant="secondary">
            Start an Inquiry
          </ButtonLink>
        </div>

        {/* optional email capture for the detailed breakdown */}
        <div className="mt-7 w-full max-w-sm border-t border-border-hair pt-6">
          {saved === "ok" ? (
            <div className="flex items-center justify-center gap-2 font-mono text-sm text-accent">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Saved — we&apos;ll be in touch.
            </div>
          ) : (
            <form onSubmit={saveEmail} className="flex flex-col gap-2">
              <label htmlFor="assess-email" className="font-mono text-xs text-muted">
                Want your detailed readiness breakdown? Leave an email.
              </label>
              <div className="flex gap-2">
                <input
                  id="assess-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="min-w-0 flex-1 rounded-md border border-border-hair bg-bg/60 px-3.5 py-2.5 text-sm text-fg placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={saved === "saving"}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2.5 font-mono text-sm font-medium text-on-accent transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {saved === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="pointer-events-none absolute -left-[9999px] h-0 w-0"
                aria-hidden
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle, Loader2, Terminal } from "lucide-react";
import { inquirySchema, type InquiryInput } from "@/lib/schema";
import { submitInquiry } from "@/app/actions/inquiry";
import {
  INQUIRY_TYPES,
  REVENUE_RANGES,
  SKU_COUNTS,
  PLATFORM_OPTIONS,
} from "@/lib/content";
import { Button } from "@/components/Button";
import { BookingButton } from "@/components/Booking";
import { track } from "@/lib/analytics";

type Variant = "full" | "compact";

type InquiryFormProps = {
  variant?: Variant;
  sourcePage: string;
  defaultType?: (typeof INQUIRY_TYPES)[number];
};

const labelCls =
  "block font-mono text-xs uppercase tracking-wider text-muted mb-1.5";
const inputCls =
  "w-full rounded-md border border-border-hair bg-bg/60 px-3.5 py-2.5 text-sm text-fg placeholder:text-muted/60 transition-colors focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40";
const errCls = "mt-1 font-mono text-xs text-[#ff7a72]";

export function InquiryForm({
  variant = "full",
  sourcePage,
  defaultType = "client",
}: InquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">(
    "idle",
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      inquiry_type: defaultType,
      revenue_range: "",
      sku_count: "",
      platforms: [],
      message: "",
      source_page: sourcePage,
      website_hp: "",
    },
  });

  const isFull = variant === "full";

  const onSubmit = handleSubmit(async (values) => {
    setStatus("submitting");
    setServerError(null);
    try {
      const res = await submitInquiry({ ...values, source_page: sourcePage });
      if (res.ok) {
        track("inquiry_submitted", {
          inquiry_type: values.inquiry_type,
          source_page: sourcePage,
          revenue_range: values.revenue_range || null,
        });
        setStatus("ok");
        reset();
      } else {
        setStatus("error");
        setServerError(res.error);
      }
    } catch {
      setStatus("error");
      setServerError("Network error. Please try again.");
    }
  });

  if (status === "ok") {
    return (
      <div className="glass flex flex-col items-center gap-4 rounded-xl p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-accent" aria-hidden />
        <div className="font-mono text-sm text-accent">
          $ inquiry --submitted ✓
        </div>
        <h3 className="font-mono text-xl font-semibold text-fg">
          Inquiry received.
        </h3>
        <p className="max-w-sm text-sm text-muted">
          Thanks — your details are in. We&apos;ll review and reach out shortly.
        </p>
        <p className="font-mono text-xs text-muted">
          Want to move faster? Book a discovery call now.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <BookingButton label="Book a discovery call" variant="primary" />
          <Button
            variant="secondary"
            type="button"
            onClick={() => setStatus("idle")}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="glass rounded-xl p-6 sm:p-7"
    >
      <div className="mb-5 flex items-center gap-2 border-b border-border-hair pb-4 font-mono text-xs text-muted">
        <Terminal className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-accent">$</span> start-inquiry --{sourcePage}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* name */}
        <div className={isFull ? "" : "sm:col-span-1"}>
          <label htmlFor={`${sourcePage}-name`} className={labelCls}>
            Name *
          </label>
          <input
            id={`${sourcePage}-name`}
            className={inputCls}
            placeholder="Jane Founder"
            autoComplete="name"
            {...register("name")}
          />
          {errors.name && <p className={errCls}>{errors.name.message}</p>}
        </div>

        {/* email */}
        <div>
          <label htmlFor={`${sourcePage}-email`} className={labelCls}>
            Email *
          </label>
          <input
            id={`${sourcePage}-email`}
            type="email"
            className={inputCls}
            placeholder="jane@company.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>

        {/* company */}
        <div>
          <label htmlFor={`${sourcePage}-company`} className={labelCls}>
            Company
          </label>
          <input
            id={`${sourcePage}-company`}
            className={inputCls}
            placeholder="Acme Goods Co."
            autoComplete="organization"
            {...register("company")}
          />
        </div>

        {/* inquiry type — full only (compact uses default) */}
        {isFull && (
          <div>
            <label htmlFor={`${sourcePage}-type`} className={labelCls}>
              Inquiry type *
            </label>
            <select
              id={`${sourcePage}-type`}
              className={inputCls}
              {...register("inquiry_type")}
            >
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t[0].toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* revenue range */}
        <div>
          <label htmlFor={`${sourcePage}-rev`} className={labelCls}>
            Annual revenue
          </label>
          <select
            id={`${sourcePage}-rev`}
            className={inputCls}
            defaultValue=""
            {...register("revenue_range")}
          >
            <option value="">Select…</option>
            {REVENUE_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* sku count — full only */}
        {isFull && (
          <div>
            <label htmlFor={`${sourcePage}-sku`} className={labelCls}>
              SKU count
            </label>
            <select
              id={`${sourcePage}-sku`}
              className={inputCls}
              defaultValue=""
              {...register("sku_count")}
            >
              <option value="">Select…</option>
              {SKU_COUNTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* platforms multi-select */}
      <div className="mt-4">
        <span className={labelCls}>Platforms used</span>
        <Controller
          control={control}
          name="platforms"
          render={({ field }) => {
            const selected = field.value ?? [];
            const toggle = (p: (typeof PLATFORM_OPTIONS)[number]) => {
              field.onChange(
                selected.includes(p)
                  ? selected.filter((x) => x !== p)
                  : [...selected, p],
              );
            };
            return (
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((p) => {
                  const on = selected.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggle(p)}
                      aria-pressed={on}
                      className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
                        on
                          ? "border-accent/60 bg-accent/10 text-accent"
                          : "border-border-hair text-muted hover:border-accent/40 hover:text-fg"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            );
          }}
        />
      </div>

      {/* message */}
      <div className="mt-4">
        <label htmlFor={`${sourcePage}-msg`} className={labelCls}>
          Message
        </label>
        <textarea
          id={`${sourcePage}-msg`}
          rows={isFull ? 5 : 3}
          className={`${inputCls} resize-y`}
          placeholder="What are you trying to figure out? (SKUs, revenue, the question on your mind…)"
          {...register("message")}
        />
      </div>

      {/* honeypot — visually hidden, off-screen, not tabbable */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={`${sourcePage}-website`}>
          Leave this field empty
        </label>
        <input
          id={`${sourcePage}-website`}
          tabIndex={-1}
          autoComplete="off"
          {...register("website_hp")}
        />
      </div>

      {status === "error" && serverError && (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-[#ff7a72]/40 bg-[#ff7a72]/10 px-4 py-3 text-sm text-[#ff9b95]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{serverError}</span>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            "Start an Inquiry"
          )}
        </Button>
        <span className="font-mono text-xs text-muted">
          INSERT-only · stored securely
        </span>
      </div>
    </form>
  );
}

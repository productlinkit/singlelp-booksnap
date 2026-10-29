import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { BookOpen, Check, CircleCheck, Headphones, Sparkles, X } from "lucide-react";
import { track } from "../analytics";
import { APP_URL, CHECKOUT_URL, FREE_SUMMARY, PLANS, TRIAL_DAYS, type Plan } from "../content";
import { BookCover, CtaButton } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;

export const screenMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.5, ease },
};

/* ── Paywall ───────────────────────────────────────────────────── */
export function Paywall({ onClose }: { onClose: () => void }) {
  const [yearly, setYearly] = useState(true);
  const [planId, setPlanId] = useState<Plan["id"]>("premium");
  const plan = PLANS.find((p) => p.id === planId)!;
  const billing = yearly ? "yearly" : "monthly";
  const terms = yearly ? `${plan.yearlyTotal} billed yearly` : `${plan.monthly} billed monthly`;

  const checkout = () => {
    track("checkout_start", { plan: plan.id, billing });
    const url = new URL(CHECKOUT_URL);
    url.searchParams.set("plan", plan.id);
    url.searchParams.set("billing", billing);
    window.location.href = url.toString();
  };

  return (
    <motion.div {...screenMotion} role="dialog" aria-modal="true" aria-label="Choose your plan" className="fixed inset-0 flex flex-col overflow-hidden bg-forest text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_0%,rgba(213,182,109,0.25),transparent_70%)]" />
      <header className="relative mx-auto flex w-full max-w-[560px] items-center justify-between px-4 pt-[max(14px,env(safe-area-inset-top))] sm:px-6">
        <div className="flex items-center gap-3">
          <BookCover book={FREE_SUMMARY.book} className="w-8" />
          <span className="text-[13px] font-semibold text-white/75">Keep reading <span className="text-white">{FREE_SUMMARY.book.title}</span></span>
        </div>
        <IconButton label="Close" onClick={onClose} dark><X className="size-5" /></IconButton>
      </header>

      <div className="relative mx-auto flex min-h-0 w-full max-w-[560px] flex-1 flex-col justify-center gap-[clamp(14px,2.6vh,26px)] overflow-y-auto px-4 py-4 sm:px-6">
        <h2 className="font-display text-[clamp(32px,min(9vw,6vh),54px)] font-extrabold leading-[1.02] tracking-[-0.035em]">
          Keep learning <span className="text-gold">in minutes.</span>
        </h2>
        <ul className="flex flex-col gap-2.5 text-[clamp(15px,2vh,17px)] font-semibold text-white/90">
          {[
            [BookOpen, "Unlock complete StoryFlow summaries"],
            [Headphones, "Access Audio Quick Recaps"],
            [Sparkles, "Explore books with Ask AI"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof BookOpen;
            return (
              <li key={label as string} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-gold"><I aria-hidden className="size-4" /></span>
                {label as string}
              </li>
            );
          })}
        </ul>

        <div role="radiogroup" aria-label="Billing period" className="inline-flex self-start rounded-full bg-white/10 p-1">
          {[false, true].map((y) => (
            <button
              key={String(y)}
              type="button"
              role="radio"
              aria-checked={yearly === y}
              onClick={() => setYearly(y)}
              className={`relative min-h-11 cursor-pointer rounded-full px-5 text-[14px] font-bold transition-colors ${yearly === y ? "text-forest" : "text-white/75"}`}
            >
              {yearly === y && <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-gold" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
              <span className="relative">{y ? "Yearly" : "Monthly"}</span>
            </button>
          ))}
        </div>

        <div role="radiogroup" aria-label="Plan" className="grid grid-cols-2 gap-3">
          {PLANS.map((p) => {
            const on = planId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPlanId(p.id)}
                className={`relative flex cursor-pointer flex-col items-start rounded-[22px] border-2 p-4 text-left transition-colors ${on ? "border-gold bg-gold/10" : "border-white/40 bg-white/[0.04] hover:border-white/60"}`}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="text-[16px] font-extrabold">{p.name}</span>
                  <span className={`grid size-5 place-items-center rounded-full border-2 ${on ? "border-gold bg-gold text-forest" : "border-white/50"}`}>
                    {on && <Check aria-hidden className="size-3" strokeWidth={3.5} />}
                  </span>
                </span>
                {p.highlight && <span className="mt-1.5 rounded-full bg-gold px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-forest">Most popular</span>}
                <span className="mt-2 text-[clamp(24px,3.6vh,30px)] font-extrabold leading-none">
                  {yearly ? p.yearlyPerMonth : p.monthly}<span className="text-[13px] font-semibold text-white/75">/mo</span>
                </span>
                <span className="mt-2 text-[13px] leading-snug text-white/75">{p.features[0]} · {p.features[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="relative mx-auto w-full max-w-[560px] px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3 sm:px-6">
        <CtaButton tone="gold" onClick={checkout} className="w-full px-6 py-[17px] text-[17px]">Start {TRIAL_DAYS}-Day Free Trial</CtaButton>
        <p className="mt-3 text-center text-[12.5px] text-white/75">{TRIAL_DAYS} days free, then {terms}.</p>
      </footer>

    </motion.div>
  );
}

/* ── Success ───────────────────────────────────────────────────── */
export function Success() {
  const start = () => {
    window.location.href = APP_URL;
  };
  return (
    <motion.div {...screenMotion} role="dialog" aria-modal="true" aria-label="Subscription confirmed" className="fixed inset-0 grid place-items-center overflow-hidden bg-cream px-5 text-forest">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_30%,rgba(213,182,109,0.35),transparent_70%)]" />
      <div className="relative flex w-full max-w-[480px] flex-col items-center text-center">
        <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}>
          <CircleCheck aria-hidden className="size-20 text-forest" strokeWidth={1.6} />
        </motion.div>
        <h1 className="mt-4 font-display text-[clamp(32px,8vw,48px)] font-extrabold leading-[1.05] tracking-[-0.035em]">You're in.</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-forest/75">Full access is unlocked. Your {TRIAL_DAYS}-day free trial has started. Your next book is one tap away.</p>
        <CtaButton onClick={start} className="mt-7 w-full px-8 py-[17px] text-[17px] sm:w-auto">Start Reading</CtaButton>
      </div>
    </motion.div>
  );
}

function IconButton({ label, onClick, disabled, dark, children }: { label: string; onClick: () => void; disabled?: boolean; dark?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-12 shrink-0 cursor-pointer place-items-center rounded-full border transition-colors disabled:cursor-default disabled:opacity-30 ${dark ? "border-white/40 text-white hover:bg-white/10" : "border-forest/50 text-forest hover:bg-forest/5"}`}
    >
      {children}
    </button>
  );
}

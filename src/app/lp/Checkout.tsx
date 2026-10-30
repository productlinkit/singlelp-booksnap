import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CircleCheck, CircleX, CreditCard, Hourglass, Loader2 } from "lucide-react";
import { PLANS, TRIAL_DAYS, type Plan } from "../content";
import { IconButton, screenMotion } from "./Funnel";
import { CtaButton } from "./ui";

/*
 * ⚠️ THIS CHECKOUT IS FRONTEND ONLY. NOTHING IS CHARGED AND NOTHING IS TAKEN.
 *
 * Card values live in this component's state only. They are never stored, never
 * put in the URL, never passed to `track()`, and never sent anywhere. Keep it
 * that way: to take payment for real, use Stripe Elements and redirect back to
 * `/?checkout=<state>&plan=<id>&billing=<period>`, which opens the screens below.
 * See "Payment flow" in the README.
 */

export type Billing = "monthly" | "yearly";
export type Order = { plan: Plan; billing: Billing };
export type PaymentState = "success" | "failed" | "pending";

const ERROR = "#b3261e";
const PROCESSING_MS = 1800;
const REDIRECT_SECONDS = 4;

export const DEFAULT_ORDER: Order = { plan: PLANS.find((p) => p.highlight) ?? PLANS[0], billing: "yearly" };

/** Reads `?checkout=<state>&plan=<id>&billing=<period>`, if it is there. */
export function paymentFromUrl(): { state: PaymentState; order: Order } | null {
  const params = new URLSearchParams(window.location.search);
  const state = params.get("checkout");
  if (state !== "success" && state !== "failed" && state !== "pending") return null;
  return {
    state,
    order: {
      plan: PLANS.find((p) => p.id === params.get("plan")) ?? DEFAULT_ORDER.plan,
      billing: params.get("billing") === "monthly" ? "monthly" : "yearly",
    },
  };
}

const priceAfterTrial = ({ plan, billing }: Order) =>
  billing === "yearly" ? `${plan.yearlyTotal} billed yearly` : `${plan.monthly} billed monthly`;

/** The last four digits choose the result, so each screen can be reached. */
function outcomeFor(card: string): PaymentState {
  if (card.endsWith("0000")) return "failed";
  if (card.endsWith("1111")) return "pending";
  return "success";
}

const groupCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const groupExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

type Values = { name: string; email: string; card: string; expiry: string; ccv: string };

/** Format checks only, in field order. Any 16 digits pass, so no real card is needed. */
function validate({ name, email, card, expiry, ccv }: Values) {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!name.trim()) errors.name = "Enter the name on the card.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errors.email = "Enter a valid email.";
  if (card.replace(/\D/g, "").length !== 16) errors.card = "Enter all 16 digits.";
  const [mm, yy] = expiry.split("/").map(Number);
  // Day 1 of the following month: a card is good through its expiry month.
  const unexpired = mm >= 1 && mm <= 12 && yy >= 0 && new Date(2000 + yy, mm, 1) > new Date();
  if (!unexpired) errors.expiry = "Enter a valid date.";
  if (!/^\d{3,4}$/.test(ccv)) errors.ccv = "Enter 3 or 4 digits.";
  return errors;
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  trailing,
  numeric,
  maxLength,
}: {
  id: keyof Values;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  disabled: boolean;
  trailing?: ReactNode;
  numeric?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label
        className={`flex min-h-[64px] flex-col justify-center gap-0.5 rounded-2xl border-[1.5px] bg-white px-4 py-2 transition-colors ${error ? "" : "border-forest/25 focus-within:border-forest"}`}
        style={error ? { borderColor: ERROR } : undefined}
      >
        <span className="text-[13px] font-semibold text-forest/75">{label}</span>
        <span className="flex items-center gap-2">
          <input
            type="text"
            data-field={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={numeric ? "numeric" : undefined}
            maxLength={maxLength}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            autoComplete="off"
            className="w-full bg-transparent text-[16px] text-forest outline-none placeholder:text-forest/40"
          />
          {trailing}
        </span>
      </label>
      {error && (
        <p className="mt-1.5 text-[13px]" style={{ color: ERROR }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Checkout ──────────────────────────────────────────────────── */
export function Checkout({ order, onBack, onResult }: { order: Order; onBack: () => void; onResult: (state: PaymentState) => void }) {
  // Local only. Never stored, never sent. See the note at the top of the file.
  const [values, setValues] = useState<Values>({ name: "", email: "", card: "", expiry: "", ccv: "" });
  const [attempted, setAttempted] = useState(false);
  const [outcome, setOutcome] = useState<PaymentState | null>(null);

  const errors = attempted ? validate(values) : {};
  const processing = outcome !== null;
  const set = (key: keyof Values) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  useEffect(() => {
    if (!outcome) return undefined;
    const timer = setTimeout(() => onResult(outcome), PROCESSING_MS);
    return () => clearTimeout(timer);
  }, [outcome, onResult]);

  const pay = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (processing) return;
    setAttempted(true);
    const [firstInvalid] = Object.keys(validate(values));
    if (firstInvalid) {
      e.currentTarget.querySelector<HTMLInputElement>(`[data-field="${firstInvalid}"]`)?.focus();
      return;
    }
    setOutcome(outcomeFor(values.card));
  };

  return (
    <motion.div {...screenMotion} className="fixed inset-0 overflow-y-auto bg-cream text-forest">
      <div className="mx-auto flex w-full max-w-[520px] flex-col px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(14px,env(safe-area-inset-top))] sm:px-6">
        <header className="flex items-center gap-3">
          <IconButton label="Back to plans" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </IconButton>
          <h1 className="font-display text-[clamp(26px,7vw,34px)] font-extrabold leading-tight tracking-[-0.03em]">Your card details</h1>
        </header>

        <section className="relative mt-5 overflow-hidden rounded-[22px] bg-forest p-5 text-white">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_100%_0%,rgba(213,182,109,0.28),transparent_70%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-extrabold">{order.plan.name}</h2>
              <p className="mt-1 text-[13.5px] font-semibold text-gold">{TRIAL_DAYS}-day free trial</p>
            </div>
            <p className="text-right">
              <span className="block font-display text-[32px] font-extrabold leading-none">$0</span>
              <span className="mt-1 block text-[12.5px] text-white/75">today</span>
            </p>
          </div>
          <p className="relative mt-3 text-[13.5px] text-white/75">Then {priceAfterTrial(order)}.</p>
        </section>

        <form noValidate onSubmit={pay} className="mt-5 flex flex-col gap-3.5">
          <Field id="name" label="Name on card" placeholder="Alexander Pierce" value={values.name} onChange={set("name")} error={errors.name} disabled={processing} />
          <Field id="email" label="Email" placeholder="example@email.com" value={values.email} onChange={set("email")} error={errors.email} disabled={processing} />
          <Field
            id="card"
            label="Card number"
            placeholder="XXXX XXXX XXXX XXXX"
            value={values.card}
            onChange={(v) => set("card")(groupCard(v))}
            error={errors.card}
            disabled={processing}
            numeric
            maxLength={19}
            trailing={<CreditCard aria-hidden className="size-5 shrink-0 text-forest/70" />}
          />
          <div className="grid grid-cols-2 gap-3.5">
            <Field id="expiry" label="Expiration date" placeholder="MM/YY" value={values.expiry} onChange={(v) => set("expiry")(groupExpiry(v))} error={errors.expiry} disabled={processing} numeric maxLength={5} />
            <Field id="ccv" label="CCV" placeholder="XXX" value={values.ccv} onChange={(v) => set("ccv")(v.replace(/\D/g, "").slice(0, 4))} error={errors.ccv} disabled={processing} numeric maxLength={4} />
          </div>

          <CtaButton type="submit" disabled={processing} arrow={!processing} className="mt-1 w-full px-6 py-[17px] text-[17px]">
            {processing ? (
              <span className="inline-flex items-center gap-2.5">
                <Loader2 aria-hidden className="size-5 animate-spin" />
                Processing…
              </span>
            ) : (
              `Start ${TRIAL_DAYS}-Day Free Trial`
            )}
          </CtaButton>
        </form>
      </div>
    </motion.div>
  );
}

/* ── Success, failed, pending ──────────────────────────────────── */
function StatusScreen({ icon, tint, title, body, order, children }: { icon: ReactNode; tint: string; title: string; body: string; order: Order; children: ReactNode }) {
  return (
    <motion.div {...screenMotion} className="fixed inset-0 grid place-items-center overflow-y-auto bg-cream px-5 py-8 text-forest">
      <div aria-hidden className="pointer-events-none fixed inset-0" style={{ background: `radial-gradient(60% 45% at 50% 30%, ${tint}, transparent 70%)` }} />
      <div className="relative flex w-full max-w-[480px] flex-col items-center text-center">
        <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}>
          {icon}
        </motion.div>
        <h1 className="mt-4 font-display text-[clamp(32px,8vw,48px)] font-extrabold leading-[1.05] tracking-[-0.035em]">{title}</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-forest/75">{body}</p>
        <dl className="mt-6 w-full rounded-[20px] border-[1.5px] border-forest/15 bg-white/70 px-5 py-1 text-[15px]">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-forest/70">Plan</dt>
            <dd className="font-bold">{order.plan.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-forest/10 py-3">
            <dt className="text-forest/70">Then</dt>
            <dd className="font-bold">{priceAfterTrial(order)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex w-full flex-col items-center gap-3">{children}</div>
      </div>
    </motion.div>
  );
}

function SecondaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="min-h-12 w-full cursor-pointer rounded-full border-[1.5px] border-forest/40 px-6 font-display text-[16px] font-bold text-forest transition-colors hover:bg-forest/5">
      {children}
    </button>
  );
}

export function PaymentSuccess({ order, onHome }: { order: Order; onHome: () => void }) {
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (seconds === 0) {
      onHome();
      return undefined;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onHome]);

  return (
    <StatusScreen
      icon={<CircleCheck aria-hidden className="size-20 text-forest" strokeWidth={1.6} />}
      tint="rgba(213,182,109,0.35)"
      title="You're in."
      body={`Full access is unlocked. Your ${TRIAL_DAYS}-day free trial has started. Your next book is one tap away.`}
      order={order}
    >
      <CtaButton onClick={onHome} className="w-full px-8 py-[17px] text-[17px]">
        Start Reading
      </CtaButton>
      <p role="status" className="text-[14px] text-forest/75">
        Taking you to Home in {seconds}s…
      </p>
    </StatusScreen>
  );
}

export function PaymentFailed({ order, onRetry, onPlans }: { order: Order; onRetry: () => void; onPlans: () => void }) {
  return (
    <StatusScreen
      icon={<CircleX aria-hidden className="size-20" strokeWidth={1.6} style={{ color: ERROR }} />}
      tint="rgba(179,38,30,0.14)"
      title="Payment failed."
      body="Your bank declined this payment, so your trial hasn't started and you weren't charged. Check your card details or try a different card."
      order={order}
    >
      <CtaButton onClick={onRetry} className="w-full px-8 py-[17px] text-[17px]">
        Try Again
      </CtaButton>
      <SecondaryButton onClick={onPlans}>Choose Another Plan</SecondaryButton>
    </StatusScreen>
  );
}

export function PaymentPending({ order, onCheck, onPlans }: { order: Order; onCheck: () => void; onPlans: () => void }) {
  return (
    <StatusScreen
      icon={<Hourglass aria-hidden className="size-20 text-forest" strokeWidth={1.4} />}
      tint="rgba(213,182,109,0.45)"
      title="Payment pending."
      body="Your bank hasn't confirmed this payment yet. This usually takes a few minutes, and your trial starts as soon as it does."
      order={order}
    >
      <CtaButton onClick={onCheck} className="w-full px-8 py-[17px] text-[17px]">
        Check Payment Status
      </CtaButton>
      <SecondaryButton onClick={onPlans}>Back to Plans</SecondaryButton>
    </StatusScreen>
  );
}

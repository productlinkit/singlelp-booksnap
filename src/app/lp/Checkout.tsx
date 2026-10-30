import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, CreditCard, Hourglass, Loader2, X } from "lucide-react";
import { PLANS, TRIAL_DAYS, type Plan } from "../content";
import { Flower, Shapes, type FlowerSpot } from "./Flowers";
import { IconButton, screenMotion } from "./Funnel";
import { SuccessArt } from "./SuccessArt";
import { CtaButton, LOGO } from "./ui";

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

const MINT = "#B9EED4";
const SPRING = "#A4F4BF";
const BUTTER = "#FFE08F";
const BLUSH = "#FFDAD6";

/** Paler than the landing page's, so they stay behind the form. */
const FLOWER_OPACITY = 0.34;

/** The landing page's flowers, placed clear of the card, with colours set per screen. */
function paymentFlowers([a, b, c, d]: string[]): FlowerSpot[] {
  return [
    { color: a, petals: [1, 0.62, 0.9, 0.55, 0.8], side: "left", y: [16, 24], size: [230, 500], rotate: 18 },
    { color: b, petals: [0.7, 1, 0.58, 0.88, 0.66], side: "left", y: [92, 88], size: [200, 400], rotate: -10 },
    { color: c, petals: [0.9, 0.6, 1, 0.64, 0.82], side: "right", y: [8, 14], size: [210, 440], rotate: -24 },
    { color: d, petals: [0.6, 0.92, 0.7, 1, 0.56], side: "right", y: [78, 74], size: [230, 480], rotate: 40 },
  ];
}

const FLOWERS = {
  checkout: paymentFlowers([MINT, BUTTER, SPRING, BLUSH]),
  success: paymentFlowers([MINT, BUTTER, SPRING, MINT]),
  failed: paymentFlowers([BLUSH, BUTTER, BLUSH, MINT]),
  pending: paymentFlowers([BUTTER, MINT, BUTTER, BLUSH]),
};

const METHODS = ["Credit Card", "Stripe"] as const;
type Method = (typeof METHODS)[number];

/** Stripe's "S" mark, from simple-icons. */
function StripeLogo() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
    </svg>
  );
}

const CARD = "rounded-[28px] border border-white bg-white shadow-[0_32px_80px_-32px_rgba(0,54,37,0.34)]";

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
function validate({ name, email, card, expiry, ccv }: Values, method: Method) {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (method === "Credit Card" && !name.trim()) errors.name = "Enter the name on the card.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errors.email = "Enter a valid email.";
  if (method !== "Credit Card") return errors;
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
        className={`flex min-h-[62px] flex-col justify-center gap-0.5 rounded-2xl border-[1.5px] bg-[#FBF8F1] px-4 py-2 transition-[background-color,border-color,box-shadow] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(0,54,37,0.08)] ${error ? "" : "border-forest/15 focus-within:border-forest"}`}
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

function MethodPicker({ method, onChange, disabled }: { method: Method; onChange: (method: Method) => void; disabled: boolean }) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 gap-2.5">
      {METHODS.map((m) => {
        const on = m === method;
        const logo = m === "Stripe" ? <span style={{ color: on ? "#fff" : "#635BFF" }}><StripeLogo /></span> : <CreditCard aria-hidden className="size-5 shrink-0" />;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(m)}
            className={`flex min-h-[54px] cursor-pointer items-center justify-center gap-2 rounded-2xl border-[1.5px] px-2 text-[15px] font-bold transition-colors ${on ? "border-forest bg-forest text-white" : "border-forest/15 bg-[#FBF8F1] text-forest hover:border-forest/40"}`}
          >
            {logo}
            {m}
          </button>
        );
      })}
    </div>
  );
}

/* ── Checkout ──────────────────────────────────────────────────── */
export function Checkout({ order, onBack, onResult }: { order: Order; onBack: () => void; onResult: (state: PaymentState) => void }) {
  // Local only. Never stored, never sent. See the note at the top of the file.
  const [values, setValues] = useState<Values>({ name: "", email: "", card: "", expiry: "", ccv: "" });
  const [attempted, setAttempted] = useState(false);
  const [outcome, setOutcome] = useState<PaymentState | null>(null);
  const [method, setMethod] = useState<Method>("Credit Card");

  const isCard = method === "Credit Card";
  const errors = attempted ? validate(values, method) : {};
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
    const [firstInvalid] = Object.keys(validate(values, method));
    if (firstInvalid) {
      e.currentTarget.querySelector<HTMLInputElement>(`[data-field="${firstInvalid}"]`)?.focus();
      return;
    }
    setOutcome(isCard ? outcomeFor(values.card) : "success");
  };

  return (
    <motion.div {...screenMotion} className="fixed inset-0 overflow-y-auto bg-cream text-forest">
      <div className="pointer-events-none fixed inset-0">
        <Shapes flowers={FLOWERS.checkout} opacity={FLOWER_OPACITY} />
      </div>

      <div className="relative mx-auto flex min-h-full w-full max-w-[1040px] flex-col px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] sm:px-6 lg:pb-8 lg:pt-5">
        <header className="grid grid-cols-[48px_1fr_48px] items-center">
          <IconButton label="Back to plans" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </IconButton>
          <img src={LOGO} alt="BookSnap" className="h-7 justify-self-center" />
        </header>

        <main className="mx-auto mt-4 grid w-full max-w-[560px] flex-1 content-center gap-4 lg:mt-5 lg:max-w-none lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6">
          <OrderSummary order={order} />

          <form noValidate onSubmit={pay} className={`${CARD} flex flex-col gap-3.5 p-5 sm:p-7 lg:p-9`}>
            <h1 className="mb-1 font-display text-[clamp(25px,6.6vw,32px)] font-extrabold leading-tight tracking-[-0.03em]">Payment details</h1>
            <MethodPicker method={method} onChange={setMethod} disabled={processing} />
            {isCard && <Field id="name" label="Name on card" placeholder="Alexander Pierce" value={values.name} onChange={set("name")} error={errors.name} disabled={processing} />}
            <Field id="email" label="Email" placeholder="example@email.com" value={values.email} onChange={set("email")} error={errors.email} disabled={processing} />
            {isCard ? (
              <>
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
              </>
            ) : (
              <p className="rounded-2xl bg-[#FBF8F1] px-4 py-3 text-[14.5px] leading-snug text-forest/80">
                You&rsquo;ll confirm your {TRIAL_DAYS}-day free trial with {method}.
              </p>
            )}

            <CtaButton type="submit" disabled={processing} arrow={!processing} className="mt-2 w-full px-6 py-[17px] text-[17px]">
              {processing ? (
                <span className="inline-flex items-center gap-2.5">
                  <Loader2 aria-hidden className="size-5 animate-spin" />
                  Processing…
                </span>
              ) : (
                isCard ? `Start ${TRIAL_DAYS}-Day Free Trial` : `Continue with ${method}`
              )}
            </CtaButton>
          </form>
        </main>
      </div>
    </motion.div>
  );
}

/** The plan beside the form. Compact on phones, where the form has to stay in reach. */
function OrderSummary({ order }: { order: Order }) {
  return (
    <section className="relative flex flex-col overflow-hidden rounded-[28px] bg-forest p-5 text-white sm:p-7 lg:p-9 lg:shadow-[0_32px_80px_-32px_rgba(0,54,37,0.6)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_100%_0%,rgba(213,182,109,0.26),transparent_70%)]" />
      <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute -bottom-16 -right-14 hidden w-[300px] rotate-[24deg] lg:block">
        <Flower color="#FFE08F" petals={[0.9, 0.6, 1, 0.64, 0.82]} opacity={0.1} />
      </svg>

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-extrabold lg:text-[24px]">{order.plan.name}</h2>
          <p className="mt-1 text-[14px] font-semibold text-gold">{TRIAL_DAYS}-day free trial</p>
        </div>
        <p className="text-right lg:hidden">
          <span className="block font-display text-[34px] font-extrabold leading-none">$0</span>
          <span className="mt-1 block text-[12.5px] text-white/75">today</span>
        </p>
      </div>
      <p className="relative mt-3 text-[14px] text-white/75 lg:hidden">Then {priceAfterTrial(order)}.</p>

      <p className="relative mt-6 hidden items-baseline gap-2 lg:flex">
        <span className="font-display text-[64px] font-extrabold leading-none tracking-[-0.04em]">$0</span>
        <span className="text-[16px] text-white/75">today</span>
      </p>

      <ul className="relative mt-7 hidden flex-col gap-3 lg:flex">
        {order.plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-[15px] text-white/90">
            <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-gold text-forest">
              <Check aria-hidden className="size-3" strokeWidth={3.5} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <ol className="relative mt-auto hidden pt-8 lg:block">
        <li className="relative border-l-2 border-white/25 pb-5 pl-5">
          <span aria-hidden className="absolute -left-[7px] top-1 size-3 rounded-full bg-gold" />
          <p className="text-[14.5px] font-bold">Today</p>
          <p className="mt-0.5 text-[14px] text-white/75">Full access starts for free.</p>
        </li>
        <li className="relative border-l-2 border-transparent pl-5">
          <span aria-hidden className="absolute -left-[7px] top-1 size-3 rounded-full border-2 border-gold bg-forest" />
          <p className="text-[14.5px] font-bold">In {TRIAL_DAYS} days</p>
          <p className="mt-0.5 text-[14px] text-white/75">Then {priceAfterTrial(order)}.</p>
        </li>
      </ol>
    </section>
  );
}

/* ── Success, failed, pending ──────────────────────────────────── */
const TONES = {
  success: { flowers: FLOWERS.success, badge: MINT, ink: "#003625" },
  failed: { flowers: FLOWERS.failed, badge: BLUSH, ink: ERROR },
  pending: { flowers: FLOWERS.pending, badge: BUTTER, ink: "#503D00" },
};

function StatusScreen({ state, icon, art, title, body, order, children }: { state: PaymentState; icon?: ReactNode; art?: ReactNode; title: string; body: string; order: Order; children: ReactNode }) {
  const tone = TONES[state];
  return (
    <motion.div {...screenMotion} className="fixed inset-0 overflow-y-auto bg-cream text-forest">
      <div className="pointer-events-none fixed inset-0">
        <Shapes flowers={tone.flowers} opacity={FLOWER_OPACITY} />
      </div>

      <div className="relative flex min-h-full flex-col items-center px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-6 lg:pt-6">
        <img src={LOGO} alt="BookSnap" className="h-7" />

        <main className="flex w-full flex-1 items-center justify-center py-5 lg:py-8">
          <div className={`${CARD} flex w-full max-w-[500px] flex-col items-center p-6 text-center sm:p-9`}>
            {art ?? (
              <motion.span
                className="grid size-[84px] place-items-center rounded-full"
                style={{ backgroundColor: tone.badge, color: tone.ink }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
              >
                {icon}
              </motion.span>
            )}
            <h1 className="mt-5 font-display text-[clamp(30px,8vw,40px)] font-extrabold leading-[1.05] tracking-[-0.035em]">{title}</h1>
            <p className="mt-3 text-[16px] leading-relaxed text-forest/75">{body}</p>

            <dl className="mt-6 w-full rounded-[18px] bg-[#FBF8F1] px-5 py-1 text-[15px]">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-forest/70">Plan</dt>
                <dd className="font-bold">{order.plan.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-forest/10 py-3">
                <dt className="text-forest/70">Today</dt>
                <dd className="font-bold">$0</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-forest/10 py-3">
                <dt className="text-forest/70">Then</dt>
                <dd className="font-bold">{priceAfterTrial(order)}</dd>
              </div>
            </dl>

            <div className="mt-6 flex w-full flex-col items-center gap-3">{children}</div>
          </div>
        </main>
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
      state="success"
      art={<SuccessArt />}
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
      state="failed"
      icon={<X aria-hidden className="size-10" strokeWidth={2.5} />}
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
      state="pending"
      icon={<Hourglass aria-hidden className="size-9" strokeWidth={2} />}
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

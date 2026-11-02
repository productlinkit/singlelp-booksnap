import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, CreditCard, Hourglass, Loader2, X } from "lucide-react";
import { PLANS, SIGN_IN_URL, TRIAL_DAYS, type Plan } from "../content";
import { Flower, Shapes, type FlowerSpot } from "./Flowers";
import { IconButton, screenMotion } from "./Funnel";
import { SuccessArt } from "./SuccessArt";
import { CtaButton, LOGO } from "./ui";

/*
 * ⚠️ THIS CHECKOUT IS FRONTEND ONLY. NOTHING IS CHARGED AND NOTHING IS TAKEN.
 *
 * Email and card values live in this component's state only. They are never stored,
 * never put in the URL, never passed to `track()`, and never sent anywhere. The success
 * screen shows the email and the card's last four digits, passed in memory. Keep it
 * that way: to take payment for real, use Stripe Elements and redirect back to
 * `/?checkout=<state>&plan=<id>&billing=<period>`, which opens the screens below.
 * See "Payment flow" in the README.
 */

export type Billing = "monthly" | "yearly";
export type Order = { plan: Plan; billing: Billing };
export type PaymentState = "success" | "failed" | "pending";
/** Who paid. `email` and `last4` stay in memory, so a reloaded screen doesn't have them. */
export type Buyer = { member: boolean; email?: string; last4?: string };

const ERROR = "#b3261e";
const PROCESSING_MS = 1800;
const CHECK_MS = 600;

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

const CARD = "rounded-[28px] border border-white bg-white shadow-[0_32px_80px_-32px_rgba(0,54,37,0.34)]";

export const DEFAULT_ORDER: Order = { plan: PLANS.find((p) => p.highlight) ?? PLANS[0], billing: "yearly" };

/** Reads `?checkout=<state>&plan=<id>&billing=<period>`, if it is there. */
export function paymentFromUrl(): { state: PaymentState; order: Order; buyer: Buyer; orderId: string } | null {
  const params = new URLSearchParams(window.location.search);
  const state = params.get("checkout");
  if (state !== "success" && state !== "failed" && state !== "pending") return null;
  return {
    state,
    order: {
      plan: PLANS.find((p) => p.id === params.get("plan")) ?? DEFAULT_ORDER.plan,
      billing: params.get("billing") === "monthly" ? "monthly" : "yearly",
    },
    buyer: { member: params.get("account") === "member" },
    orderId: params.get("order") ?? newOrderId(),
  };
}

/** Stands in for the ID the backend gives each order. */
export function newOrderId() {
  return `BS-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

const formatDate = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

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

/** "new" has no account, "member" has one with no subscription, "subscriber" has both. */
type Account = "new" | "member" | "subscriber";

/** Stands in for the backend's lookup, so each case can be reached. */
function accountFor(email: string): Account {
  const address = email.toLowerCase();
  if (address === "subscriber@example.com") return "subscriber";
  if (address === "member@example.com") return "member";
  return "new";
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

type Values = { email: string; card: string; expiry: string; ccv: string };

/** Format checks only, in field order. Any 16 digits pass, so no real card is needed. */
function validate({ email, card, expiry, ccv }: Values) {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!isEmail(email.trim())) errors.email = "Enter a valid email.";
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
  onBlur,
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
  onBlur?: () => void;
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
            onBlur={onBlur}
            placeholder={placeholder}
            inputMode={numeric ? "numeric" : id === "email" ? "email" : undefined}
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
export function Checkout({ order, onBack, onResult }: { order: Order; onBack: () => void; onResult: (state: PaymentState, buyer: Buyer) => void }) {
  // Local only. Never stored, never sent. See the note at the top of the file.
  const [values, setValues] = useState<Values>({ email: "", card: "", expiry: "", ccv: "" });
  const [attempted, setAttempted] = useState(false);
  const [checking, setChecking] = useState<string | null>(null);
  const [checked, setChecked] = useState<{ email: string; account: Account } | null>(null);
  const [outcome, setOutcome] = useState<PaymentState | null>(null);

  const errors = attempted ? validate(values) : {};
  const processing = outcome !== null;
  const email = values.email.trim();
  const account = checked?.account ?? null;
  const member = account === "member";
  const subscriber = account === "subscriber";
  const showCard = account === "new" || member;
  const formRef = useRef<HTMLFormElement>(null);
  const set = (key: keyof Values) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  useEffect(() => {
    if (!outcome) return undefined;
    const timer = setTimeout(() => onResult(outcome, { member, email, last4: values.card.slice(-4) }), PROCESSING_MS);
    return () => clearTimeout(timer);
  }, [outcome, member, email, values.card, onResult]);

  useEffect(() => {
    if (!checking) return undefined;
    const timer = setTimeout(() => {
      setChecked({ email: checking, account: accountFor(checking) });
      setChecking(null);
    }, CHECK_MS);
    return () => clearTimeout(timer);
  }, [checking]);

  useEffect(() => {
    if (showCard) formRef.current?.querySelector<HTMLInputElement>('[data-field="card"]')?.focus();
  }, [showCard]);

  const checkEmail = () => {
    if (!isEmail(email) || email === checked?.email || email === checking) return;
    setAttempted(false);
    setChecking(email);
  };

  const pay = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (processing || checking) return;
    if (email !== checked?.email) {
      if (isEmail(email)) return checkEmail();
      setAttempted(true);
      e.currentTarget.querySelector<HTMLInputElement>('[data-field="email"]')?.focus();
      return;
    }
    if (subscriber) return window.location.assign(SIGN_IN_URL);
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

        <main className={`mx-auto mt-4 grid w-full max-w-[560px] flex-1 content-center gap-4 lg:mt-5 lg:gap-6 ${subscriber ? "" : "lg:max-w-none lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"}`}>
          {!subscriber && <OrderSummary order={order} />}

          <form ref={formRef} noValidate onSubmit={pay} className={`${CARD} flex flex-col justify-center gap-3.5 p-5 sm:p-7 lg:p-9`}>
            <h1 className="mb-1 font-display text-[clamp(25px,6.6vw,32px)] font-extrabold leading-tight tracking-[-0.03em]">{subscriber ? "Welcome back" : "Payment details"}</h1>
            <Field id="email" label="Email" placeholder="example@email.com" value={values.email} onChange={set("email")} onBlur={checkEmail} error={errors.email} disabled={processing} />

            {showCard && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3.5">
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
              </motion.div>
            )}

            {subscriber && (
              <motion.div role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4" style={{ backgroundColor: MINT }}>
                <p className="text-[15px] font-bold">You already have a subscription.</p>
                <p className="mt-1 text-[14px] leading-snug text-forest/80">There's nothing to pay. Log in to keep reading.</p>
              </motion.div>
            )}

            <CtaButton type="submit" disabled={processing || checking !== null} arrow={!processing && !checking} className="mt-2 w-full px-6 py-[17px] text-[17px]">
              {processing || checking ? (
                <span className="inline-flex items-center gap-2.5">
                  <Loader2 aria-hidden className="size-5 animate-spin" />
                  {processing ? "Processing…" : "Checking…"}
                </span>
              ) : subscriber ? (
                "Login"
              ) : showCard ? (
                `Start ${TRIAL_DAYS}-Day Free Trial`
              ) : (
                "Continue"
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

function OrderDetails({ order }: { order: Order }) {
  return (
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
  );
}

function StatusScreen({ state, icon, art, details, aside, title, body, order, children }: { state: PaymentState; icon?: ReactNode; art?: ReactNode; details?: ReactNode; aside?: ReactNode; title: string; body: string; order: Order; children: ReactNode }) {
  const tone = TONES[state];
  return (
    <motion.div {...screenMotion} className="fixed inset-0 overflow-y-auto bg-cream text-forest">
      <div className="pointer-events-none fixed inset-0">
        <Shapes flowers={tone.flowers} opacity={FLOWER_OPACITY} />
      </div>

      <div className="relative flex min-h-full flex-col items-center px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-6 lg:pt-6">
        <img src={LOGO} alt="BookSnap" className="h-7" />

        <main className={`grid w-full flex-1 content-center justify-items-center gap-4 py-5 lg:py-8 ${aside ? "max-w-[500px] lg:max-w-[980px] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-6" : ""}`}>
          <div className={`${CARD} flex w-full max-w-[500px] flex-col items-center p-6 text-center sm:p-9 ${aside ? "lg:max-w-none" : ""}`}>
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

            {details === undefined ? <OrderDetails order={order} /> : details}

            <div className="mt-6 flex w-full flex-col items-center gap-3">{children}</div>
          </div>
          {aside}
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

const SIGN_IN_STEPS = [
  ["Open the email from BookSnap", "Check your spam folder if you don't see it."],
  ["Copy your temporary password", "It's in the email we just sent you."],
  ["Sign in to BookSnap", "Use your email and temporary password."],
];

function OrderReceipt({ order, buyer, orderId }: { order: Order; buyer: Buyer; orderId: string }) {
  const rows: [string, string | undefined][] = [
    ["Order ID", orderId],
    ["Date", formatDate(new Date())],
    ["Plan", order.plan.name],
    ["Email", buyer.email],
    ["Payment method", buyer.last4 && `Card ending ${buyer.last4}`],
    ["Free trial", `${TRIAL_DAYS} days`],
  ];
  return (
    <section className="relative flex w-full max-w-[500px] flex-col overflow-hidden rounded-[28px] bg-forest p-6 text-left text-white sm:p-9 lg:max-w-none lg:shadow-[0_32px_80px_-32px_rgba(0,54,37,0.6)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_100%_0%,rgba(213,182,109,0.26),transparent_70%)]" />
      <h2 className="relative text-[20px] font-extrabold lg:text-[24px]">Order details</h2>

      <dl className="relative mt-4 text-[15px]">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 border-b border-white/15 py-3">
              <dt className="shrink-0 text-white/75">{label}</dt>
              <dd className="min-w-0 break-words text-right font-semibold">{value}</dd>
            </div>
          ))}
      </dl>

      <div className="relative mt-auto pt-6">
        <p className="flex items-baseline justify-between gap-4">
          <span className="text-[15px] font-bold">Paid today</span>
          <span className="font-display text-[34px] font-extrabold leading-none tracking-[-0.03em]">$0</span>
        </p>
        <p className="mt-2 text-[14px] leading-snug text-white/75">
          Then {priceAfterTrial(order)}, starting {formatDate(daysFromNow(TRIAL_DAYS))}.
        </p>
      </div>
    </section>
  );
}

export function PaymentSuccess({ order, buyer, orderId }: { order: Order; buyer: Buyer; orderId: string }) {
  const signIn = (
    <CtaButton onClick={() => window.location.assign(SIGN_IN_URL)} className="w-full px-8 py-[17px] text-[17px]">
      Sign In to BookSnap
    </CtaButton>
  );
  const receipt = <OrderReceipt order={order} buyer={buyer} orderId={orderId} />;

  if (buyer.member) {
    return (
      <StatusScreen state="success" art={<SuccessArt />} aside={receipt} details={null} title="You're all set." body={`Your ${order.plan.name} subscription is active. Sign in with your email and your existing password.`} order={order}>
        {signIn}
      </StatusScreen>
    );
  }

  return (
    <StatusScreen
      state="success"
      art={<SuccessArt />}
      aside={receipt}
      title="Check your email."
      body={`Your ${TRIAL_DAYS}-day free trial of ${order.plan.name} has started. We've sent you a temporary password to sign in.`}
      order={order}
      details={
        <ol className="mt-6 flex w-full flex-col gap-4 rounded-[18px] bg-[#FBF8F1] p-5 text-left">
          {SIGN_IN_STEPS.map(([title, hint], i) => (
            <li key={title} className="flex items-start gap-3.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-forest text-[14px] font-bold text-white">{i + 1}</span>
              <span>
                <span className="block text-[15px] font-bold leading-snug">{title}</span>
                <span className="mt-0.5 block text-[14px] leading-snug text-forest/70">{hint}</span>
              </span>
            </li>
          ))}
        </ol>
      }
    >
      {signIn}
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

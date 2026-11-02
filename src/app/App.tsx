import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import "./components/landing.css";
import { track } from "./analytics";
import { FREE_SUMMARY } from "./content";
import { Checkout, DEFAULT_ORDER, PaymentFailed, PaymentPending, PaymentSuccess, paymentFromUrl, type Order, type PaymentState } from "./lp/Checkout";
import { Landing } from "./lp/Landing";
import { Paywall } from "./lp/Funnel";
import { Reader } from "./lp/Reader";

type Stage = "landing" | "preview" | "paywall" | "checkout" | PaymentState;

export default function App() {
  // `/?checkout=<state>&plan=<id>&billing=<period>` opens a result screen directly.
  const [fromUrl] = useState(paymentFromUrl);
  const [stage, setStage] = useState<Stage>(fromUrl?.state ?? "landing");
  const [order, setOrder] = useState<Order>(fromUrl?.order ?? DEFAULT_ORDER);

  useEffect(() => {
    if (fromUrl) track("demo_payment_result", { state: fromUrl.state, plan: fromUrl.order.plan.id });
    else track("landing_page_view", { path: window.location.pathname });
  }, [fromUrl]);

  const startPreview = () => {
    track("cta_click", { cta: "explore_free_summary" });
    track("preview_start", { book: FREE_SUMMARY.book.id });
    setStage("preview");
  };

  const showResult = useCallback(
    (state: PaymentState) => {
      track("demo_payment_result", { state, plan: order.plan.id, billing: order.billing });
      window.history.replaceState(null, "", `/?checkout=${state}&plan=${order.plan.id}&billing=${order.billing}`);
      setStage(state);
    },
    [order],
  );

  const leaveResult = (next: Stage) => {
    window.history.replaceState(null, "", "/");
    setStage(next);
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {stage === "landing" && <Landing key="landing" onStart={startPreview} />}
        {stage === "preview" && (
          <Reader
            key="preview"
            onClose={() => setStage("landing")}
            onPaywall={(source) => {
              track("paywall_view", { source });
              setStage("paywall");
            }}
          />
        )}
        {stage === "paywall" && (
          <Paywall
            key="paywall"
            initial={order}
            onClose={() => setStage("landing")}
            onCheckout={(next) => {
              setOrder(next);
              setStage("checkout");
            }}
          />
        )}
        {stage === "checkout" && <Checkout key="checkout" order={order} onBack={() => setStage("paywall")} onResult={showResult} />}
        {stage === "success" && <PaymentSuccess key="success" order={order} />}
        {stage === "failed" && <PaymentFailed key="failed" order={order} onRetry={() => leaveResult("checkout")} onPlans={() => leaveResult("paywall")} />}
        {stage === "pending" && <PaymentPending key="pending" order={order} onCheck={() => showResult("success")} onPlans={() => leaveResult("paywall")} />}
      </AnimatePresence>
    </MotionConfig>
  );
}

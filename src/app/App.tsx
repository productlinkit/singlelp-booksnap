import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import "./components/landing.css";
import { track } from "./analytics";
import { FREE_SUMMARY } from "./content";
import { Landing } from "./lp/Landing";
import { Paywall, Success } from "./lp/Funnel";
import { Reader } from "./lp/Reader";

type Stage = "landing" | "preview" | "paywall" | "success";

export default function App() {
  const [stage, setStage] = useState<Stage>("landing");

  useEffect(() => {
    // A real checkout redirects back to /?checkout=success&plan=<id>.
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      track("subscription_success", { plan: params.get("plan") ?? undefined });
      setStage("success");
      return;
    }
    track("landing_page_view", { path: window.location.pathname });
  }, []);

  const startPreview = () => {
    track("cta_click", { cta: "explore_free_summary" });
    track("preview_start", { book: FREE_SUMMARY.book.id });
    setStage("preview");
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
            onClose={() => setStage("landing")}
          />
        )}
        {stage === "success" && (
          <Success key="success" />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

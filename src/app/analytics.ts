// Funnel tracking. Events go to window.dataLayer, so Google Tag Manager, Meta Pixel
// or any other tag can pick them up without code changes.
export type FunnelEvent =
  | "landing_page_view"
  | "cta_click"
  | "preview_start"
  | "preview_complete"
  | "feature_use"
  | "paywall_view"
  | "checkout_start"
  // Not a conversion event: the checkout is frontend only, so tags must not count
  // these as sales.
  | "demo_payment_result";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// Ad attribution (utm_*, fbclid, gclid) captured on landing and attached to every event.
const attribution: Record<string, string> = (() => {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith("utm_") || key === "fbclid" || key === "gclid") out[key] = value;
  });
  return out;
})();

export function track(event: FunnelEvent, props: Record<string, unknown> = {}) {
  const payload = { event, ...attribution, ...props, ts: Date.now() };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  if (import.meta.env.DEV) console.info("[track]", payload);
}

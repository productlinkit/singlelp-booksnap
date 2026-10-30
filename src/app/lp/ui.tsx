import { motion } from "motion/react";
import { ArrowRight, Brain, BriefcaseBusiness, Cloud, Feather, Fingerprint, Heart, PersonStanding, Rocket, WandSparkles, type LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { Book } from "../content";

export const LOGO = "/booksnap-logo.png";

// Category icons, matching the chips in the BookSnap app's Explore tab.
const ICONS: [RegExp, LucideIcon][] = [
  [/business|money|wealth/i, BriefcaseBusiness],
  [/skill|psycholog/i, Brain],
  [/drama|romance/i, Heart],
  [/histor|literar|biograph|memoir/i, Feather],
  [/fiction$|adventure|sci-fi|apocalyp/i, Rocket],
  [/dystop|philosoph/i, Cloud],
  [/fantasy/i, WandSparkles],
  [/crime|thriller/i, Fingerprint],
];
export const categoryIcon = (name: string): LucideIcon => (/non-fiction/i.test(name) ? PersonStanding : ICONS.find(([re]) => re.test(name))?.[1] ?? PersonStanding);

// Colours of the BookSnap mobile app UI (reader, action bar, bottom nav).
export const APP = { green: "#3E9B78", greenDark: "#237A5B", yellow: "#F2C916", chrome: "#48484B", ink: "#2A2A2A" };

export function CtaButton({
  children,
  onClick,
  tone = "forest",
  className = "",
  arrow = true,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "forest" | "gold";
  className?: string;
  arrow?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const colors =
    tone === "forest"
      ? "bg-forest text-white shadow-[0_18px_40px_-14px_rgba(0,54,37,0.7)] hover:bg-pine"
      : "bg-gold text-forest shadow-[0_18px_40px_-14px_rgba(0,0,0,0.6)] hover:bg-[#e0c482]";
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={`cta-shine group relative inline-flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full font-display font-bold transition-colors ${colors} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {arrow && (
        <ArrowRight aria-hidden className="relative z-10 size-[1.15em] transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
      )}
    </motion.button>
  );
}

export function BookCover({ book, className = "", style }: { book: Book; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`relative aspect-[9/16] overflow-hidden rounded-[4%_6%_6%_4%/2.5%_3.5%_3.5%_2.5%] bg-forest shadow-[0_18px_40px_-16px_rgba(0,0,0,0.55)] ${className}`}
      style={style}
      aria-hidden
    >
      <img src={book.cover} alt="" className="h-full w-full object-cover" draggable={false} />
      {/* Spine shading so it reads as a physical book */}
      <span className="absolute inset-y-0 left-0 w-[5%] bg-gradient-to-r from-black/25 to-transparent" />
    </div>
  );
}

export function Waveform({ bars = 14, className = "", color = "currentColor", playing = true }: { bars?: number; className?: string; color?: string; playing?: boolean }) {
  return (
    <span className={`flex items-center gap-[2px] ${className}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <i
          key={i}
          className={`block h-full w-[3px] origin-center rounded-full ${playing ? "wave-bar" : ""}`}
          style={{ backgroundColor: color, animationDelay: `${(i % 7) * 0.11}s`, transform: playing ? undefined : `scaleY(${0.3 + ((i * 37) % 60) / 100})` }}
        />
      ))}
    </span>
  );
}

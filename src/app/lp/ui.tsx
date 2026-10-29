import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { Book } from "../content";

export const LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBkeISwAl82X1Rirs10VojoJsJGIKaPoPyu_7ohwU2GtxLoL5fQkKq8SrQadgmURAhnPw1dIkuUYXWuyjUOUFKJHQCIZg74yhimGUuGXkKFQKtu-65mZPJ3fyPkzveYOFHtWzaIXUJNWtN2Ub852JLKISSALazX7qsa_tAd2GNI20oXayjmho0eiB_FpntsLUL8vsKt4bFkz7Vxla7syokk06XSv8__CG1kVjxxO0jlij9xURFo2AlSGiaGXFhB8_hZikbLusnhG_dI";

export function CtaButton({
  children,
  onClick,
  tone = "forest",
  className = "",
  arrow = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "forest" | "gold";
  className?: string;
  arrow?: boolean;
}) {
  const colors =
    tone === "forest"
      ? "bg-forest text-white shadow-[0_18px_40px_-14px_rgba(0,54,37,0.7)] hover:bg-pine"
      : "bg-gold text-forest shadow-[0_18px_40px_-14px_rgba(0,0,0,0.6)] hover:bg-[#e0c482]";
  return (
    <motion.button
      type="button"
      onClick={onClick}
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

export function SampleTag({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-current/50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] ${className}`}>
      Sample content
    </span>
  );
}

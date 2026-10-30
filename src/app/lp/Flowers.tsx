import type { CSSProperties } from "react";
import { motion } from "motion/react";

/* Soft, organic flowers so the cream isn't empty: big ones in booksnap.ai's accent
   colours (yellow, mint, light mint, blush), half hidden past the left and right
   edges, clear of the content. */

const ease = [0.16, 1, 0.3, 1] as const;

// Long, slim, rounded petal reaching from the centre (50,50) to the top edge of a 100×100 box.
const PETAL = "M50 50 C 44 38 36 24 37 12 C 38 -2 62 -2 63 12 C 64 24 56 38 50 50 Z";

export function Flower({ color, petals, opacity = 0.55 }: { color: string; petals: number[]; opacity?: number }) {
  return (
    <g fill={color} fillOpacity={opacity}>
      {petals.map((len, i) => (
        <path key={i} d={PETAL} transform={`rotate(${(i * 360) / petals.length} 50 50) translate(50 50) scale(${len}) translate(-50 -50)`} />
      ))}
      <circle cx="50" cy="50" r="5" />
    </g>
  );
}

// y = vertical position (% of the page) on phones / desktop; size in px on phones / desktop.
// `petals` lists each petal's length, so every flower has its own uneven shape.
export type FlowerSpot = { color: string; petals: number[]; side: "left" | "right"; y: [number, number]; size: [number, number]; rotate: number };

export function Shapes({ flowers, opacity }: { flowers: FlowerSpot[]; opacity?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {flowers.map((f, i) => (
        <motion.div
          key={i}
          className={`absolute top-[var(--y)] w-[var(--s)] -translate-y-1/2 lg:top-[var(--y-lg)] lg:w-[var(--s-lg)] ${f.side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"}`}
          style={{ "--y": `${f.y[0]}%`, "--y-lg": `${f.y[1]}%`, "--s": `${f.size[0]}px`, "--s-lg": `clamp(${Math.round(f.size[1] * 0.75)}px, ${(f.size[1] / 14.4).toFixed(1)}vw, ${Math.round(f.size[1] * 1.3)}px)` } as CSSProperties}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease, delay: 0.2 + i * 0.12 }}
        >
          {/* Gentle float on the GPU (CSS), different pace per flower */}
          <svg viewBox="0 0 100 100" className="lp-drift block w-full" style={{ animationDuration: `${9 + i * 1.5}s`, animationDelay: `${-i * 2}s`, rotate: `${f.rotate}deg` }}>
            <Flower color={f.color} petals={f.petals} opacity={opacity} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

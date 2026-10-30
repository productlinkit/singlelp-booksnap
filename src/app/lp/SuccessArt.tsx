import { motion } from "motion/react";
import { Flower } from "./Flowers";

/* The success illustration: the free summary's book, opened, with the page's
   flower growing out of it and a tick at its heart. It plays once on arrival. */

const FOREST = "#003625";
const MINT = "#B9EED4";
const SPRING = "#A4F4BF";
const BUTTER = "#FFE08F";
const BLUSH = "#FFDAD6";
const GOLD = "#D5B66D";
const PAGE = "#FBF8F1";

const ease = [0.16, 1, 0.3, 1] as const;
const CENTRE = { transformBox: "fill-box", transformOrigin: "center" } as const;
const BASE = { transformBox: "fill-box", transformOrigin: "bottom" } as const;

function Leaf({ d, delay }: { d: string; delay: number }) {
  return <motion.path d={d} fill={SPRING} stroke={FOREST} strokeWidth={2} strokeLinejoin="round" style={BASE} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease, delay }} />;
}

function Sparkle({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  return (
    <motion.path
      d={`M${x} ${y - size} Q${x} ${y} ${x + size} ${y} Q${x} ${y} ${x} ${y + size} Q${x} ${y} ${x - size} ${y} Q${x} ${y} ${x} ${y - size} Z`}
      fill={color}
      style={CENTRE}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 14, delay }}
    />
  );
}

export function SuccessArt() {
  return (
    <svg aria-hidden viewBox="0 0 240 178" className="h-auto w-[210px] overflow-visible sm:w-[220px]">
      {/* Soft ground */}
      <ellipse cx="120" cy="166" rx="100" ry="9" fill={MINT} fillOpacity={0.55} />

      {/* The book */}
      <motion.g initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease }}>
        <path d="M18 146 Q70 128 120 148 Q170 128 222 146 V158 Q170 140 120 160 Q70 140 18 158 Z" fill={FOREST} />
        <path d="M28 82 Q76 66 120 86 V150 Q76 130 28 146 Z" fill={PAGE} stroke={FOREST} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M212 82 Q164 66 120 86 V150 Q164 130 212 146 Z" fill="#fff" stroke={FOREST} strokeWidth={2.5} strokeLinejoin="round" />
        <g fill="none" stroke={FOREST} strokeOpacity={0.22} strokeWidth={3} strokeLinecap="round">
          <path d="M44 100 Q72 91 102 100" />
          <path d="M44 113 Q72 104 102 113" />
          <path d="M44 126 Q66 119 86 123" />
          <path d="M138 100 Q168 91 196 100" />
          <path d="M138 113 Q168 104 196 113" />
          <path d="M154 123 Q174 119 196 126" />
        </g>
      </motion.g>

      {/* The stem and leaves */}
      <motion.path
        d="M120 112 C120 90 118 74 120 50"
        fill="none"
        stroke={FOREST}
        strokeWidth={3.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
      />
      <Leaf d="M120 92 C106 88 94 78 90 64 C106 64 118 76 120 92 Z" delay={0.55} />
      <Leaf d="M120 84 C134 80 146 70 150 56 C134 56 122 68 120 84 Z" delay={0.65} />

      {/* The flower, with the tick at its heart */}
      <motion.g style={CENTRE} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 170, damping: 13, delay: 0.55 }}>
        <svg x="66" y="-28" width="108" height="108" viewBox="0 0 100 100" overflow="visible">
          <g transform="rotate(36 50 50)">
            <Flower color={BLUSH} petals={[0.92, 0.92, 0.92, 0.92, 0.92]} opacity={1} />
          </g>
          <Flower color={BUTTER} petals={[0.8, 0.8, 0.8, 0.8, 0.8]} opacity={1} />
        </svg>
        <circle cx="120" cy="26" r="17" fill={FOREST} />
        <path d="M112 26 L118 32 L129 20" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>

      <Sparkle x={40} y={40} size={9} color={GOLD} delay={0.95} />
      <Sparkle x={200} y={30} size={11} color={GOLD} delay={1.05} />
      <Sparkle x={62} y={12} size={5} color={MINT} delay={1.15} />
      <Sparkle x={186} y={62} size={5} color={MINT} delay={1.2} />
    </svg>
  );
}

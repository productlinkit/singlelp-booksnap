import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, BookOpen, Bookmark, Headphones, Heart, House, Lightbulb, ListFilter, MessageCircle, Pause, PenLine, Play, Search, Share2, Sparkles, UserRound, Volume2 } from "lucide-react";
import { SHOWCASE, type Book } from "../content";
import { BookCover, CtaButton, LOGO, SampleTag, Waveform } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease, delay },
});

export function Landing({ onStart }: { onStart: () => void }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  // WCAG 2.2.2: the rotating preview can be paused, and holds still on hover/focus.
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const running = !reduce && !paused && !hovering;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % SHOWCASE.length), 4200);
    return () => clearInterval(id);
  }, [running]);

  return (
    <main
      className="relative grid h-dvh w-full overflow-hidden bg-cream text-forest
        [grid-template-areas:'logo'_'copy'_'visual'_'cta'] grid-rows-[auto_auto_minmax(0,1fr)_auto]
        lg:[grid-template-areas:'logo_visual'_'copy_visual'_'cta_visual'_'rest_visual'] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]
        lg:grid-rows-[auto_minmax(0,1fr)_auto_minmax(0,0.8fr)]"
    >
      {/* Soft light on the cream side */}
      <div aria-hidden className="pointer-events-none absolute -left-[20%] -top-[30%] h-[80%] w-[70%] rounded-full bg-white/70 blur-[120px]" />

      <motion.img
        {...rise(0)}
        src={LOGO}
        alt="BookSnap"
        className="relative z-10 ml-4 mt-[max(16px,env(safe-area-inset-top))] h-7 w-auto justify-self-start
          lg:ml-[clamp(40px,5.5vw,112px)] lg:mt-[clamp(28px,5vh,56px)] lg:h-[clamp(28px,3.4vh,38px)]"
        style={{ gridArea: "logo" }}
      />

      {/* Copy */}
      <section
        className="relative z-10 flex flex-col gap-[clamp(8px,1.2vh,12px)] px-4 pt-[clamp(16px,2.4vh,24px)]
          lg:self-end lg:gap-[clamp(16px,2.4vh,24px)] lg:pb-[clamp(24px,3.5vh,40px)] lg:pl-[clamp(40px,5.5vw,112px)] lg:pr-[clamp(24px,3vw,64px)] lg:pt-[clamp(24px,4vh,48px)]"
        style={{ gridArea: "copy" }}
      >
        <motion.h1
          {...rise(0.08)}
          className="font-display text-[clamp(40px,11.5vw,60px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-forest
            lg:text-[clamp(60px,min(5.6vw,10.5vh),140px)]"
        >
          No Time to Read?
        </motion.h1>
        <motion.p
          {...rise(0.18)}
          className="font-display text-[clamp(19px,5.4vw,24px)] font-bold leading-[1.2] tracking-[-0.02em] text-pine
            lg:max-w-[18ch] lg:text-[clamp(24px,min(2.3vw,4vh),46px)]"
        >
          Get the Best Ideas from Books{" "}
          <span className="relative whitespace-nowrap">
            <span className="relative z-10">in Minutes.</span>
            <motion.span
              aria-hidden
              className="absolute inset-x-[-2px] bottom-[0.06em] z-0 h-[0.38em] origin-left rounded-sm bg-gold/70"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease, delay: 0.7 }}
            />
          </span>
        </motion.p>
        <motion.p
          {...rise(0.26)}
          className="hidden max-w-[34ch] text-[15px] leading-[1.55] text-forest/75 [@media(min-height:760px)]:block
            lg:block lg:text-[clamp(16px,min(1.25vw,2.1vh),22px)]"
        >
          Discover powerful insights, listen anywhere, and learn smarter with BookSnap.
        </motion.p>
      </section>

      {/* Product visual */}
      <motion.section
        aria-label="BookSnap app preview"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease, delay: 0.15 }}
        className="relative z-10 mx-4 mt-[clamp(12px,2vh,20px)] flex min-h-0 flex-col overflow-hidden rounded-[28px] bg-forest
          lg:m-[clamp(16px,1.2vw,24px)] lg:ml-0 lg:rounded-[clamp(32px,3vw,56px)]"
        style={{ gridArea: "visual" }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(213,182,109,0.28),transparent_60%),radial-gradient(70%_50%_at_50%_100%,rgba(22,74,55,0.9),transparent_70%)]" />
        <div
          role="img"
          aria-label={`BookSnap app showing a summary of ${SHOWCASE[idx].title} by ${SHOWCASE[idx].author}, with an audio recap and Ask AI`}
          className="relative flex min-h-0 flex-1 items-center justify-center pt-[clamp(12px,2vh,24px)]"
        >
          <ProductScene book={SHOWCASE[idx]} idx={idx} />
        </div>
        <div className="relative z-20 flex items-center justify-between px-3 pb-3 pt-1 lg:px-5 lg:pb-5">
          <SampleTag className="text-cream" />
          {!reduce && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play book preview" : "Pause book preview"}
              className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/40 text-cream transition-colors hover:bg-white/10"
            >
              {paused ? <Play aria-hidden className="size-4 fill-current" /> : <Pause aria-hidden className="size-4 fill-current" />}
            </button>
          )}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        {...rise(0.34)}
        className="relative z-10 flex flex-col items-stretch gap-3 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4
          lg:items-start lg:self-start lg:gap-4 lg:pb-0 lg:pl-[clamp(40px,5.5vw,112px)] lg:pr-8 lg:pt-2"
        style={{ gridArea: "cta" }}
      >
        <CtaButton onClick={onStart} className="w-full px-8 py-[17px] text-[17px] lg:w-auto lg:px-[clamp(32px,2.6vw,48px)] lg:py-[clamp(18px,2.3vh,24px)] lg:text-[clamp(17px,min(1.2vw,2.1vh),22px)]">
          Explore a Free Summary
        </CtaButton>
        <ul className="flex items-center justify-center gap-2 text-[13px] font-semibold text-forest/75 lg:justify-start lg:pl-1 lg:text-[clamp(14px,1.6vh,16px)]" aria-label="Read, listen, ask AI">
          <li className="flex items-center gap-1.5"><BookOpen aria-hidden className="size-4 text-gold-ink" />Read</li>
          <li aria-hidden className="text-gold">•</li>
          <li className="flex items-center gap-1.5"><Headphones aria-hidden className="size-4 text-gold-ink" />Listen</li>
          <li aria-hidden className="text-gold">•</li>
          <li className="flex items-center gap-1.5"><Sparkles aria-hidden className="size-4 text-gold-ink" />Ask AI</li>
        </ul>
      </motion.section>
    </main>
  );
}

/* Phone + neighbouring covers + floating audio / Ask AI. Everything is sized in
   container units (cqw) of the phone, so the whole scene scales as one piece. */
function ProductScene({ book, idx }: { book: Book; idx: number }) {
  const prev = SHOWCASE[(idx + SHOWCASE.length - 1) % SHOWCASE.length];
  const next = SHOWCASE[(idx + 1) % SHOWCASE.length];

  return (
    <div className="@container relative aspect-[9/19.5] h-[92%] max-h-[820px] lg:h-[86%]">
      {/* Covers peeking out behind the phone */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`l-${prev.id}`}
          className="absolute left-[-44cqw] top-[18%] w-[50cqw]"
          initial={{ opacity: 0, x: 30, rotate: -4 }}
          animate={{ opacity: 0.8, x: 0, rotate: -11 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.9, ease }}
        >
          <BookCover book={prev} />
        </motion.div>
        <motion.div
          key={`r-${next.id}`}
          className="absolute right-[-44cqw] top-[26%] w-[50cqw]"
          initial={{ opacity: 0, x: 40, rotate: 18 }}
          animate={{ opacity: 0.8, x: 0, rotate: 11 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.9, ease }}
        >
          <BookCover book={next} />
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="relative h-full w-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <Phone book={book} />
      </motion.div>

      {/* Audio recap */}
      <motion.div
        className="absolute left-[-50cqw] top-[56%] hidden items-center gap-[3cqw] rounded-full bg-paper py-[2.6cqw] pl-[2.6cqw] pr-[5cqw] shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)] lg:flex"
        style={{ fontSize: "clamp(11px, 4.4cqw, 15px)" }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 0.9, duration: 0.6 }, x: { delay: 0.9, duration: 0.6 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
      >
        <span className="grid size-[2.3em] place-items-center rounded-full bg-forest text-gold">
          <Play aria-hidden className="size-[1em] fill-current" />
        </span>
        <span className="flex flex-col gap-[0.25em]">
          <span className="hidden font-bold leading-none text-forest lg:block">Audio Quick Recap</span>
          <Waveform bars={12} color="#D5B66D" className="h-[1.3em]" />
        </span>
      </motion.div>

      {/* Ask AI */}
      <motion.div
        className="absolute right-[-56cqw] top-[13%] hidden w-[74cqw] rounded-[5cqw] rounded-br-[1.5cqw] bg-paper p-[4.5cqw] shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)] lg:block"
        style={{ fontSize: "clamp(12px, 4.2cqw, 15px)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7, ease }}
      >
        <div className="flex items-center gap-[0.4em] text-[0.78em] font-extrabold uppercase tracking-[0.1em] text-gold-ink">
          <Sparkles aria-hidden className="size-[1.2em]" /> Ask AI
        </div>
        <div className="mt-[0.5em] font-bold leading-snug text-forest">{book.ask.q}</div>
        <TypedText key={book.id} text={book.ask.a} className="mt-[0.45em] block leading-snug text-forest/75" />
      </motion.div>
    </div>
  );
}

// Mirrors the real BookSnap reading screen (For You feed). Engagement counts are
// left out on purpose: they would read as unverified social proof on an ad page.
const APP = { green: "#3E9B78", yellow: "#F2C916", chrome: "#48484B", ink: "#2A2A2A" };

function Phone({ book }: { book: Book }) {
  return (
    <div className="absolute inset-0 rounded-[15cqw] bg-[#121413] p-[2.6cqw] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[12.5cqw] bg-white" style={{ fontSize: "4.7cqw", color: APP.ink }}>
        {/* Status bar + island */}
        <div className="flex h-[12cqw] shrink-0 items-center justify-between px-[7cqw] pt-[2cqw] text-[0.85em] font-bold">
          <span>9:41</span>
          <span className="absolute left-1/2 top-[2.6cqw] h-[8cqw] w-[28cqw] -translate-x-1/2 rounded-full bg-[#121413]" />
          <span className="h-[2.4cqw] w-[5cqw] rounded-[0.8cqw] border-[0.5cqw]" style={{ borderColor: APP.ink }} />
        </div>

        {/* Top bar: filter · For You / My Library · notifications */}
        <div className="flex shrink-0 items-center justify-between px-[4cqw] pb-[3cqw]">
          <span className="grid size-[10cqw] place-items-center rounded-full bg-[#DDE6E1]">
            <ListFilter aria-hidden className="size-[5cqw]" style={{ color: APP.green }} />
          </span>
          <span className="flex rounded-[2.4cqw] p-[1cqw] text-[0.75em] font-bold text-white" style={{ backgroundColor: APP.chrome }}>
            <span className="rounded-[1.8cqw] px-[4cqw] py-[1.8cqw]" style={{ backgroundColor: APP.green }}>For You</span>
            <span className="px-[4cqw] py-[1.8cqw]">My Library</span>
          </span>
          <span className="grid size-[10cqw] place-items-center rounded-full bg-[#E6F2EC]">
            <Bell aria-hidden className="size-[5cqw]" style={{ color: APP.green }} />
          </span>
        </div>

        {/* Reading area */}
        <div className="relative min-h-0 flex-1 overflow-hidden px-[7cqw]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease }}
            >
              <div className="flex items-center gap-[3.5cqw] py-[2cqw]">
                <div className="w-[13cqw] shrink-0 [perspective:400px]">
                  <motion.div initial={{ rotateY: -40 }} animate={{ rotateY: 0 }} transition={{ duration: 0.7, ease }}>
                    <BookCover book={book} />
                  </motion.div>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[1.12em] font-extrabold leading-tight">{book.title}</div>
                  <div className="text-[0.85em] opacity-70">{book.author}</div>
                </div>
              </div>
              {book.excerpt.map((para, i) => (
                <p key={i} className="mt-[3cqw] leading-[1.55]">{para}</p>
              ))}
            </motion.div>
          </AnimatePresence>
          {/* Fade text out under the action bar, like a scrolling feed */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[16cqw] bg-gradient-to-t from-white to-transparent" />

          {/* Floating note + listen buttons */}
          <div className="absolute bottom-[6cqw] right-[3cqw] flex flex-col gap-[3cqw]">
            <span className="grid size-[11cqw] place-items-center rounded-full bg-white shadow-[0_2cqw_5cqw_rgba(0,0,0,0.15)]">
              <PenLine aria-hidden className="size-[5cqw]" style={{ color: APP.green }} />
            </span>
            <span className="grid size-[11cqw] place-items-center rounded-full shadow-[0_2cqw_5cqw_rgba(0,0,0,0.15)]" style={{ backgroundColor: APP.yellow }}>
              <Volume2 aria-hidden className="size-[5cqw]" style={{ color: APP.green }} />
            </span>
          </div>
        </div>

        {/* Page dots */}
        <div className="flex shrink-0 justify-center gap-[1.6cqw] py-[2cqw]">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className={`h-[1.8cqw] rounded-full ${i === 1 ? "w-[6cqw]" : "w-[1.8cqw]"}`} style={{ backgroundColor: i === 1 ? APP.yellow : "#3a3a3a" }} />
          ))}
        </div>

        {/* Action bar (counts intentionally omitted) */}
        <div className="mx-[4cqw] mb-[3cqw] flex shrink-0 items-center justify-around rounded-full py-[2.6cqw]" style={{ backgroundColor: APP.yellow }}>
          {[Heart, MessageCircle, Share2, Bookmark].map((Icon, i) => (
            <Icon key={i} aria-hidden className="size-[5.4cqw]" style={{ color: "#2E8B6A", fill: i === 2 ? "none" : "#2E8B6A" }} />
          ))}
        </div>

        {/* Bottom nav */}
        <div className="flex shrink-0 items-start justify-around pb-[4cqw] pt-[2.6cqw] text-[0.72em] text-white/85" style={{ backgroundColor: APP.chrome }}>
          {[
            [House, "Home"],
            [Search, "Explore"],
            [Lightbulb, "ASK.AI"],
            [UserRound, "Profile"],
          ].map(([Icon, label], i) => {
            const I = Icon as typeof House;
            return (
              <span key={label as string} className="flex flex-col items-center gap-[0.8cqw]" style={{ color: i === 0 ? APP.yellow : undefined }}>
                <I aria-hidden className="size-[5.4cqw]" strokeWidth={1.8} />
                <span className={i === 0 ? "font-bold" : ""}>{label as string}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TypedText({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return;
    let tick: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      tick = setInterval(() => setN((c) => Math.min(text.length, c + 2)), 28);
    }, 500);
    return () => {
      clearTimeout(start);
      clearInterval(tick);
    };
  }, [text, reduce]);
  return (
    <span className={className} aria-label={text}>
      {text.slice(0, n)}
      {n < text.length && <span className="ml-[1px] inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-forest/60" />}
    </span>
  );
}

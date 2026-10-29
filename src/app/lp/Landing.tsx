import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, BookOpen, Bookmark, ChevronLeft, ChevronRight, Headphones, Heart, History, House, Lightbulb, ListFilter, MessageCircle, PenLine, Play, Search, SendHorizontal, Settings, Share2, Sparkles, UserRound, Volume2 } from "lucide-react";
import { CATEGORIES, FREE_SUMMARY, SHOWCASE, VIDEO_BANNER, type Book } from "../content";
import { APP, BookCover, CtaButton, LOGO, Waveform } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease, delay },
});

// The phone tours the app's main screens, so the page shows more than books.
const SCREENS = [
  { id: "read", nav: 0, describe: (b: Book) => `reading the ${b.title} summary` },
  { id: "watch", nav: 0, describe: (b: Book) => `playing the ${b.title} video summary` },
  { id: "explore", nav: 1, describe: () => "the Explore tab with search, video summaries and categories" },
  { id: "ask", nav: 2, describe: () => `Ask AI answering a question about ${FREE_SUMMARY.book.title}` },
  { id: "profile", nav: 3, describe: () => "the profile with saved books and reading history" },
] as const;
type ScreenId = (typeof SCREENS)[number]["id"];

export function Landing({ onStart }: { onStart: () => void }) {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  // The tour plays like a video, holds still on hover/focus, and stays put with
  // reduced motion.
  const [hovering, setHovering] = useState(false);
  const running = !reduce && !hovering;
  const screen = SCREENS[tick % SCREENS.length];
  const book = SHOWCASE[Math.floor(tick / SCREENS.length) % SHOWCASE.length];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 3800);
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
          aria-label={`BookSnap app ${screen.describe(book)}`}
          className="relative flex min-h-0 flex-1 items-center justify-center py-[clamp(12px,2vh,24px)] [container-type:size]"
        >
          <ProductScene book={book} screen={screen.id} tick={tick} />
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
   container units (cqw) of the phone, so the whole scene scales as one piece. On
   desktop the phone is capped at 42% of the panel width so the chips always fit. */
function ProductScene({ book, screen, tick }: { book: Book; screen: ScreenId; tick: number }) {
  const prev = SHOWCASE[(tick + SHOWCASE.length - 1) % SHOWCASE.length];
  const next = SHOWCASE[(tick + 1) % SHOWCASE.length];

  return (
    <div className="@container relative aspect-[9/19.5] h-[92%] max-h-[820px] lg:h-auto lg:w-[min(42cqw,calc(86cqh*9/19.5),378px)]">
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
        <Phone book={book} screen={screen} />
      </motion.div>

      {/* Audio recap */}
      <motion.div
        className={`absolute left-[-50cqw] top-[56%] hidden items-center gap-[3cqw] rounded-full bg-paper py-[2.6cqw] pl-[2.6cqw] pr-[5cqw] shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)] ${screen === "read" ? "xl:flex" : ""}`}
        style={{ fontSize: "clamp(11px, 4.4cqw, 15px)" }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 0.9, duration: 0.6 }, x: { delay: 0.9, duration: 0.6 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
      >
        <span className="grid size-[2.3em] place-items-center rounded-full bg-forest text-gold">
          <Play aria-hidden className="size-[1em] fill-current" />
        </span>
        <span className="flex flex-col gap-[0.25em]">
          <span className="hidden font-bold leading-none text-forest xl:block">Audio Quick Recap</span>
          <Waveform bars={12} color="#D5B66D" className="h-[1.3em]" />
        </span>
      </motion.div>

      {/* Ask AI (only beside the reading screen; the others speak for themselves) */}
      <motion.div
        className={`absolute right-[-56cqw] top-[13%] hidden w-[74cqw] rounded-[5cqw] rounded-br-[1.5cqw] bg-paper p-[4.5cqw] shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)] ${screen === "read" ? "xl:block" : ""}`}
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

// Mirrors the real BookSnap app screens. Engagement counts are left out on
// purpose: they would read as unverified social proof on an ad page.
function Phone({ book, screen }: { book: Book; screen: ScreenId }) {
  const nav = SCREENS.find((s) => s.id === screen)!.nav;
  return (
    <div className="absolute inset-0 rounded-[15cqw] bg-[#121413] p-[2.6cqw] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      <div
        className="relative flex h-full w-full flex-col overflow-hidden rounded-[12.5cqw] transition-colors duration-500"
        style={{ fontSize: "4.7cqw", color: APP.ink, backgroundColor: screen === "watch" ? "#000" : "#fff" }}
      >
        {/* Status bar + island */}
        <div className={`relative z-10 flex h-[12cqw] shrink-0 items-center justify-between px-[7cqw] pt-[2cqw] text-[0.85em] font-bold ${screen === "watch" ? "text-white" : ""}`}>
          <span>9:41</span>
          <span className="absolute left-1/2 top-[2.6cqw] h-[8cqw] w-[28cqw] -translate-x-1/2 rounded-full bg-[#121413]" />
          <span className="h-[2.4cqw] w-[5cqw] rounded-[0.8cqw] border-[0.5cqw] border-current" />
        </div>

        <div className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={screen === "read" || screen === "watch" ? `${screen}-${book.id}` : screen}
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
            >
              {screen === "read" && <ReadScreen book={book} />}
              {screen === "watch" && <WatchScreen book={book} />}
              {screen === "explore" && <ExploreScreen />}
              {screen === "ask" && <AskScreen />}
              {screen === "profile" && <ProfileScreen />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav follows the screen */}
        <div className="flex shrink-0 items-start justify-around pb-[4cqw] pt-[2.6cqw] text-[0.72em] text-white/85" style={{ backgroundColor: APP.chrome }}>
          {[
            [House, "Home"],
            [Search, "Explore"],
            [Lightbulb, "ASK.AI"],
            [UserRound, "Profile"],
          ].map(([Icon, label], i) => {
            const I = Icon as typeof House;
            return (
              <span key={label as string} className="flex flex-col items-center gap-[0.8cqw] transition-colors" style={{ color: i === nav ? APP.yellow : undefined }}>
                <I aria-hidden className="size-[5.4cqw]" strokeWidth={1.8} />
                <span className={i === nav ? "font-bold" : ""}>{label as string}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReadScreen({ book }: { book: Book }) {
  return (
    <>
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

      <div className="relative min-h-0 flex-1 overflow-hidden px-[7cqw]">
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
        {/* Fade text out under the action bar, like a scrolling feed */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[16cqw] bg-gradient-to-t from-white to-transparent" />
        <div className="absolute bottom-[6cqw] right-[3cqw] flex flex-col gap-[3cqw]">
          <span className="grid size-[11cqw] place-items-center rounded-full bg-white shadow-[0_2cqw_5cqw_rgba(0,0,0,0.15)]">
            <PenLine aria-hidden className="size-[5cqw]" style={{ color: APP.green }} />
          </span>
          <span className="grid size-[11cqw] place-items-center rounded-full shadow-[0_2cqw_5cqw_rgba(0,0,0,0.15)]" style={{ backgroundColor: APP.yellow }}>
            <Volume2 aria-hidden className="size-[5cqw]" style={{ color: APP.green }} />
          </span>
        </div>
      </div>

      <div className="flex shrink-0 justify-center gap-[1.6cqw] py-[2cqw]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`h-[1.8cqw] rounded-full ${i === 1 ? "w-[6cqw]" : "w-[1.8cqw]"}`} style={{ backgroundColor: i === 1 ? APP.yellow : "#3a3a3a" }} />
        ))}
      </div>
      <div className="mx-[4cqw] mb-[3cqw] flex shrink-0 items-center justify-around rounded-full py-[2.6cqw]" style={{ backgroundColor: APP.yellow }}>
        {[Heart, MessageCircle, Share2, Bookmark].map((Icon, i) => (
          <Icon key={i} aria-hidden className="size-[5.4cqw]" style={{ color: "#2E8B6A", fill: i === 2 ? "none" : "#2E8B6A" }} />
        ))}
      </div>
    </>
  );
}

function WatchScreen({ book }: { book: Book }) {
  const caption = book.excerpt[0].split(/(?<=[.!?])\s/)[0];
  return (
    <div className="relative -mt-[12cqw] flex-1 overflow-hidden text-white">
      <img src={book.cover} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75" />
      <span className="absolute left-[4cqw] top-[14cqw] grid size-[9cqw] place-items-center rounded-full bg-[#888B8B]/80">
        <ChevronLeft aria-hidden className="size-[5cqw]" />
      </span>
      <div className="absolute inset-x-[4cqw] top-[26cqw] h-[1cqw] overflow-hidden rounded-full bg-white/25">
        <motion.div className="h-full rounded-full bg-[#EFB100]" initial={{ width: "8%" }} animate={{ width: "70%" }} transition={{ duration: 3.6, ease: "linear" }} />
      </div>
      <div className="absolute inset-x-[7cqw] top-[34cqw] flex flex-col items-center gap-[6cqw]">
        <motion.div className="w-[44cqw]" initial={{ scale: 1 }} animate={{ scale: 1.06 }} transition={{ duration: 3.8, ease: "easeInOut" }}>
          <BookCover book={book} className="shadow-[0_6cqw_12cqw_-3cqw_rgba(0,0,0,0.7)]" />
        </motion.div>
        <p className="text-center text-[1.05em] font-bold leading-snug [text-shadow:0_1cqw_4cqw_rgba(0,0,0,0.6)]">{caption}</p>
      </div>
      <div className="absolute inset-x-[5cqw] bottom-[5cqw]">
        <div className="font-bold leading-tight">{book.title}</div>
        <div className="mt-[1cqw] flex items-center gap-[1.5cqw] text-[0.8em] text-white/75">
          {book.author} · <Play aria-hidden className="size-[2.8cqw] fill-current" /> Video summary
        </div>
      </div>
    </div>
  );
}

function ExploreScreen() {
  return (
    <div className="flex-1 overflow-hidden px-[5cqw]">
      <div className="flex items-center justify-between rounded-[2cqw] bg-[#45474B] px-[4cqw] py-[3cqw] text-[0.85em] text-[#C4C4C4]">
        Find your favorite book...
        <Search aria-hidden className="size-[4.6cqw] text-white" />
      </div>
      <div className="relative mt-[4cqw] overflow-hidden rounded-[4cqw]">
        <img src={VIDEO_BANNER} alt="" className="block h-[28cqw] w-full object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 text-white">
          <span className="mb-[1.5cqw] grid size-[10cqw] place-items-center rounded-full bg-[#276B54]/85">
            <Play aria-hidden className="ml-[0.5cqw] size-[5cqw] fill-current" />
          </span>
          <span className="text-[0.85em] font-bold">Video Summary</span>
          <span className="text-[0.7em] text-white/85">Watch short book summaries</span>
        </div>
      </div>
      <div className="mt-[5cqw] text-[1em] font-bold text-[#45474B]">Categories</div>
      <div className="mt-[2.5cqw] flex gap-[2cqw] overflow-hidden whitespace-nowrap">
        {CATEGORIES.map((c, i) => (
          <span
            key={c}
            className="rounded-full border px-[3cqw] py-[1.2cqw] text-[0.72em] font-semibold"
            style={i === 0 ? { backgroundColor: APP.greenDark, borderColor: APP.greenDark, color: "#fff" } : { borderColor: "#BDBDBD", color: "#45474B" }}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="mt-[5cqw] text-[1em] font-bold text-[#45474B]">All books</div>
      <div className="mt-[2.5cqw] grid grid-cols-3 gap-[3cqw]">
        {SHOWCASE.map((b) => (
          <div key={b.id}>
            <BookCover book={b} />
            <div className="mt-[1cqw] truncate text-[0.68em] font-semibold">{b.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AskScreen() {
  const { book, ask } = FREE_SUMMARY;
  return (
    <div className="flex flex-1 flex-col overflow-hidden px-[5cqw]">
      <div className="flex items-center gap-[2cqw] pb-[3cqw] text-[1.05em] font-extrabold">
        <Sparkles aria-hidden className="size-[5cqw] text-gold-ink" /> ASK.AI
      </div>
      <div className="flex items-center gap-[2.5cqw] rounded-[3cqw] bg-[#F2F2F2] p-[2cqw]">
        <BookCover book={book} className="w-[8cqw]" />
        <span className="text-[0.8em] font-bold">{book.title}</span>
      </div>
      <div className="mt-[4cqw] flex flex-col gap-[3cqw]">
        <motion.div
          className="self-end rounded-[4cqw] rounded-br-[1cqw] px-[3.5cqw] py-[2.5cqw] text-[0.85em] font-semibold text-white"
          style={{ backgroundColor: APP.greenDark }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {ask[1].q}
        </motion.div>
        <motion.div
          className="max-w-[90%] rounded-[4cqw] rounded-bl-[1cqw] bg-[#F2F2F2] px-[3.5cqw] py-[2.5cqw] text-[0.85em] leading-snug"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <TypedText text={ask[1].a} />
        </motion.div>
      </div>
      <div className="mt-auto flex flex-col gap-[2cqw] pb-[3cqw]">
        {[ask[0].q, ask[2].q].map((q) => (
          <span key={q} className="self-start rounded-full border px-[3cqw] py-[1.5cqw] text-[0.72em] font-semibold" style={{ borderColor: "#D6D6D6", color: APP.greenDark }}>
            {q}
          </span>
        ))}
        <div className="mt-[1cqw] flex items-center justify-between rounded-full border border-[#CFCFCF] py-[1cqw] pl-[4cqw] pr-[1cqw] text-[0.8em] text-[#8A8A8A]">
          Ask anything about this book…
          <span className="grid size-[8cqw] place-items-center rounded-full text-white" style={{ backgroundColor: APP.greenDark }}>
            <SendHorizontal aria-hidden className="size-[4cqw]" />
          </span>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen() {
  const rows: [typeof History, string][] = [
    [Bookmark, "My Library"],
    [History, "Reading history"],
    [Bell, "Notifications"],
    [Settings, "Preferences"],
  ];
  return (
    <div className="flex-1 overflow-hidden px-[5cqw]">
      <div className="flex items-center gap-[3.5cqw] pb-[4cqw] pt-[1cqw]">
        <span className="grid size-[14cqw] place-items-center rounded-full text-[1.1em] font-extrabold text-white" style={{ backgroundColor: APP.greenDark }}>
          <UserRound aria-hidden className="size-[7cqw]" />
        </span>
        <div>
          <div className="text-[1.05em] font-extrabold">Your profile</div>
          <div className="text-[0.75em] text-[#5F5F5F]">Account, preferences and history</div>
        </div>
      </div>
      <div className="text-[0.75em] font-extrabold uppercase tracking-[0.08em] text-[#5F5F5F]">Continue reading</div>
      <div className="mt-[2.5cqw] flex flex-col gap-[2.5cqw]">
        {SHOWCASE.slice(0, 2).map((b, i) => (
          <div key={b.id} className="flex items-center gap-[3cqw] rounded-[3cqw] bg-[#F2F2F2] p-[2cqw]">
            <BookCover book={b} className="w-[9cqw]" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[0.82em] font-bold">{b.title}</div>
              <div className="mt-[1.5cqw] h-[1.2cqw] overflow-hidden rounded-full bg-[#DADADA]">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: APP.green }} initial={{ width: 0 }} animate={{ width: i ? "35%" : "70%" }} transition={{ duration: 0.9, ease, delay: 0.2 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[4cqw] text-[0.75em] font-extrabold uppercase tracking-[0.08em] text-[#5F5F5F]">Saved</div>
      <div className="mt-[2.5cqw] grid grid-cols-4 gap-[2.5cqw]">
        {SHOWCASE.slice(1).map((b) => <BookCover key={b.id} book={b} />)}
      </div>
      <div className="mt-[3cqw] divide-y divide-[#EDEDED]">
        {rows.map(([Icon, label]) => (
          <div key={label} className="flex items-center gap-[3cqw] py-[2.8cqw] text-[0.85em] font-semibold">
            <Icon aria-hidden className="size-[4.6cqw]" style={{ color: APP.greenDark }} />
            <span className="flex-1">{label}</span>
            <ChevronRight aria-hidden className="size-[4cqw] text-[#9A9A9A]" />
          </div>
        ))}
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

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, BookOpen, Bookmark, ChevronLeft, CreditCard, Globe, Headphones, Headset, Heart, Highlighter, House, Info, Lightbulb, ListFilter, LogOut, MessageCircle, MessageCircleQuestion, PenLine, Play, Search, SendHorizontal, Settings, Share2, Sparkles, UserRound, Volume2 } from "lucide-react";
import profileAvatar from "../../imports/profile-avatar.jpg";
import { FREE_SUMMARY, SHOWCASE, VIDEO_BANNER, VIDEO_FEED, type Book } from "../content";
import { Shapes, type FlowerSpot } from "./Flowers";
import { APP, BookCover, categoryIcon, CtaButton, LOGO, Waveform } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease, delay },
});

// The phone tours the app's main screens, so the page shows more than books.
const SCREENS = [
  { id: "cover", nav: 0, describe: (b: Book) => `showing the cover of ${b.title}` },
  { id: "read", nav: 0, describe: (b: Book) => `reading the ${b.title} summary` },
  { id: "watch", nav: 0, describe: () => `playing the ${VIDEO_FEED[0].title} video summary` },
  { id: "explore", nav: 1, describe: () => "the Explore tab with search, video summaries and categories" },
  { id: "ask", nav: 2, describe: () => `Ask AI answering a question about ${FREE_SUMMARY.book.title}, with the free one-question limit` },
  { id: "profile", nav: 3, describe: () => "the profile with subscription, preferences, liked books, highlights and support" },
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
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, [running]);

  return (
    <main
      className="relative grid h-dvh w-full overflow-hidden bg-cream text-forest
        [grid-template-areas:'logo'_'copy'_'visual'_'cta'] grid-rows-[auto_auto_minmax(0,1fr)_auto]
        lg:[grid-template-areas:'logo'_'copy'_'cta'_'visual'] lg:grid-rows-[auto_auto_auto_minmax(0,1fr)]"
    >
      {/* Soft light behind the copy */}
      <div aria-hidden className="pointer-events-none absolute -left-[20%] -top-[30%] h-[80%] w-[70%] rounded-full bg-white/70 blur-[120px] lg:left-1/2 lg:w-[60%] lg:-translate-x-1/2" />

      <Shapes flowers={FLOWERS} />

      <motion.img
        {...rise(0)}
        src={LOGO}
        alt="BookSnap"
        className="relative z-10 mt-[max(16px,env(safe-area-inset-top))] h-7 w-auto justify-self-center
          lg:mt-[clamp(20px,3.2vh,40px)] lg:h-[clamp(26px,3.2vh,36px)]"
        style={{ gridArea: "logo" }}
      />

      {/* Copy */}
      <section
        className="relative z-10 flex flex-col items-center gap-[clamp(8px,1.2vh,12px)] px-4 text-center pt-[clamp(10px,1.8vh,20px)]
          lg:gap-[clamp(8px,1.4vh,16px)] lg:px-8 lg:pt-[clamp(14px,2.6vh,32px)]"
        style={{ gridArea: "copy" }}
      >
        <motion.h1
          {...rise(0.08)}
          className="font-display text-[clamp(40px,11.5vw,60px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-forest
            lg:text-[clamp(48px,min(5.4vw,8.4vh),112px)]"
        >
          No Time to Read?
        </motion.h1>
        <motion.p
          {...rise(0.18)}
          className="font-display text-[clamp(19px,5.4vw,24px)] font-bold leading-[1.2] tracking-[-0.02em] text-pine
            lg:text-[clamp(22px,min(2.1vw,3.6vh),40px)]"
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
            lg:max-w-[60ch] lg:text-[clamp(15px,min(1.15vw,2vh),20px)]"
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
        className="relative z-10 mx-4 mt-[clamp(4px,1vh,12px)] flex min-h-0 flex-col overflow-hidden
          lg:mx-auto lg:mb-[clamp(8px,1.4vh,16px)] lg:mt-[clamp(6px,1.2vh,16px)] lg:w-[min(1280px,calc(100%-48px))]"
        style={{ gridArea: "visual" }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
      >
        <div
          role="img"
          aria-label={`BookSnap app ${screen.describe(book)}`}
          className="relative flex min-h-0 flex-1 items-center justify-center py-[clamp(6px,1.2vh,16px)] lg:py-[clamp(12px,2vh,24px)] [container-type:size]"
        >
          <ProductScene book={book} screen={screen.id} tick={tick} />
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        {...rise(0.34)}
        className="relative z-10 flex flex-col items-stretch gap-3 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2 lg:pt-4
          lg:items-center lg:gap-[clamp(8px,1.4vh,14px)] lg:px-8 lg:pb-0 lg:pt-[clamp(14px,2.6vh,30px)]"
        style={{ gridArea: "cta" }}
      >
        <CtaButton onClick={onStart} className="w-full px-8 py-[17px] text-[17px] lg:w-auto lg:px-[clamp(32px,2.6vw,48px)] lg:py-[clamp(14px,2vh,22px)] lg:text-[clamp(16px,min(1.15vw,2vh),20px)]">
          Explore a Free Summary
        </CtaButton>
        <ul className="flex items-center justify-center gap-2 text-[13px] font-semibold text-forest/75 lg:text-[clamp(13px,1.6vh,16px)]" aria-label="Read, listen, ask AI">
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

const FLOWERS: FlowerSpot[] = [
  { color: "#B9EED4", petals: [1, 0.62, 0.9, 0.55, 0.8], side: "left", y: [44, 26], size: [210, 480], rotate: 18 },
  { color: "#FFE08F", petals: [0.7, 1, 0.58, 0.88, 0.66], side: "left", y: [84, 84], size: [170, 380], rotate: -10 },
  { color: "#A4F4BF", petals: [0.9, 0.6, 1, 0.64, 0.82], side: "right", y: [34, 22], size: [200, 440], rotate: -24 },
  { color: "#FFDAD6", petals: [0.6, 0.92, 0.7, 1, 0.56], side: "right", y: [74, 76], size: [190, 440], rotate: 40 },
];

/* Phone + neighbouring covers + floating audio / Ask AI. Everything is sized in
   container units (cqw) of the phone, so the whole scene scales as one piece. On
   desktop the floating audio / Ask AI chips sit beside the phone, in the wide panel. */
function ProductScene({ book, screen, tick }: { book: Book; screen: ScreenId; tick: number }) {
  const prev = SHOWCASE[(tick + SHOWCASE.length - 1) % SHOWCASE.length];
  const next = SHOWCASE[(tick + 1) % SHOWCASE.length];

  return (
    <div className="@container relative aspect-[9/19.5] h-[100%] max-h-[820px] lg:h-auto lg:w-[min(42cqw,calc(86cqh*9/19.5),378px)]">
      {/* Covers peeking out behind the phone */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`l-${prev.id}`}
          className="absolute left-[-44cqw] hidden lg:block top-[18%] w-[50cqw]"
          initial={{ opacity: 0, x: 30, rotate: -4 }}
          animate={{ opacity: 0.8, x: 0, rotate: -11 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.9, ease }}
        >
          <BookCover book={prev} />
        </motion.div>
        <motion.div
          key={`r-${next.id}`}
          className="absolute right-[-44cqw] hidden lg:block top-[26%] w-[50cqw]"
          initial={{ opacity: 0, x: 40, rotate: 18 }}
          animate={{ opacity: 0.8, x: 0, rotate: 11 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.9, ease }}
        >
          <BookCover book={next} />
        </motion.div>
      </AnimatePresence>

      <div className="lp-float relative h-full w-full">
        <Phone book={book} screen={screen} />
      </div>

      {/* Audio recap */}
      <motion.div
        className={`absolute right-[calc(100%+20px)] top-[58%] hidden items-center gap-3 whitespace-nowrap rounded-full bg-paper py-2 pl-2 pr-4 text-[14px] shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)] ${screen === "read" ? "lg:flex" : ""}`}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <span className="grid size-[2.3em] place-items-center rounded-full bg-forest text-gold">
          <Play aria-hidden className="size-[1em] fill-current" />
        </span>
        <span className="flex flex-col gap-[0.25em]">
          <span className="font-bold leading-none text-forest">Audio Quick Recap</span>
          <Waveform bars={12} color="#D5B66D" className="h-[1.3em]" />
        </span>
      </motion.div>

      {/* Ask AI (only beside the reading screen; the others speak for themselves) */}
      <motion.div
        className={`absolute left-[calc(100%+20px)] top-[12%] hidden w-[clamp(210px,110cqw,280px)] rounded-[20px] rounded-bl-[6px] bg-paper p-4 text-[14px] shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)] ${screen === "read" ? "lg:block" : ""}`}
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
    <div className="absolute inset-0 rounded-[15cqw] bg-[#121413] p-[2.6cqw] shadow-[0_14px_28px_-14px_rgba(0,54,37,0.35),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
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
          <AnimatePresence initial={false}>
            <motion.div
              key={screen === "read" || screen === "cover" ? `${screen}-${book.id}` : screen}
              className="absolute inset-0 flex flex-col"
              // Cover → summary slides sideways like a swipe; other screens fade up.
              initial={screen === "read" ? { opacity: 0, x: "35%" } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={screen === "cover" ? { opacity: 0, x: "-35%" } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease }}
            >
              {screen === "cover" && <CoverScreen book={book} />}
              {screen === "read" && <ReadScreen book={book} />}
              {screen === "watch" && <WatchScreen />}
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

function TopBar() {
  return (
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
  );
}

function Dots({ active }: { active: number }) {
  return (
    <div className="flex shrink-0 justify-center gap-[1.6cqw] py-[2cqw]">
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className={`h-[1.8cqw] rounded-full ${i === active ? "w-[6cqw]" : "w-[1.8cqw]"}`} style={{ backgroundColor: i === active ? APP.yellow : "#3a3a3a" }} />
      ))}
    </div>
  );
}

function ActionBar() {
  return (
    <div className="mx-[4cqw] mb-[3cqw] flex shrink-0 items-center justify-around rounded-full py-[2.6cqw]" style={{ backgroundColor: APP.yellow }}>
      {[Heart, MessageCircle, Share2, Bookmark].map((Icon, i) => (
        <Icon key={i} aria-hidden className="size-[5.4cqw]" style={{ color: "#2E8B6A", fill: i === 2 ? "none" : "#2E8B6A" }} />
      ))}
    </div>
  );
}

/* For You feed, first card: the full book cover with "Swipe to Read". */
function CoverScreen({ book }: { book: Book }) {
  return (
    <>
      <TopBar />
      <div className="mx-[3cqw] mb-[3cqw] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[5cqw]" style={{ backgroundColor: book.color }}>
        <img src={book.cover} alt="" className="min-h-0 w-full flex-1 object-contain" />
        <div className="flex shrink-0 justify-center">
          <span className="flex items-center gap-[2cqw] rounded-full border-[0.3cqw] border-white/25 bg-black/25 px-[5cqw] py-[2.2cqw] text-[0.85em] font-bold text-white">
            Swipe to Read
            <span className="flex">
              {[0, 1, 2].map((i) => (
                <ChevronLeft key={i} aria-hidden className="-ml-[1.5cqw] size-[4cqw] first:ml-0" style={{ opacity: 1 - i * 0.3 }} />
              ))}
            </span>
          </span>
        </div>
        <Dots active={0} />
        <ActionBar />
      </div>
    </>
  );
}

/* Swiped to the summary text, with the video summary card below it. */
function ReadScreen({ book }: { book: Book }) {
  return (
    <>
      <TopBar />
      <div className="relative min-h-0 flex-1 overflow-hidden px-[7cqw] pt-[2cqw]">
        <p className="leading-[1.55]">{book.excerpt[0]}</p>
        <div className="mt-[4cqw] flex items-center gap-[2.5cqw] rounded-[4cqw] bg-[#2F6B55] p-[2.4cqw]">
          <img src={book.cover} alt="" className="w-[9cqw] shrink-0 rounded-[1.2cqw]" />
          <div className="min-w-0 flex-1 text-white">
            <div className="truncate text-[0.8em] font-bold">Video summary available</div>
            <div className="truncate text-[0.65em] text-white/85">Watch visual breakdown now</div>
          </div>
          <span className="flex shrink-0 items-center gap-[1cqw] rounded-full bg-[#F2B705] px-[3cqw] py-[1.6cqw] text-[0.72em] font-bold text-[#1F2A24]">
            <Play aria-hidden className="size-[2.8cqw] fill-current" /> Play
          </span>
        </div>
        <div className="absolute bottom-[4cqw] right-[3cqw] flex flex-col gap-[3cqw]">
          <span className="grid size-[11cqw] place-items-center rounded-full bg-white shadow-[0_2cqw_5cqw_rgba(0,0,0,0.15)]">
            <PenLine aria-hidden className="size-[5cqw]" style={{ color: APP.green }} />
          </span>
          <span className="grid size-[11cqw] place-items-center rounded-full shadow-[0_2cqw_5cqw_rgba(0,0,0,0.15)]" style={{ backgroundColor: APP.yellow }}>
            <Volume2 aria-hidden className="size-[5cqw]" style={{ color: APP.green }} />
          </span>
        </div>
      </div>
      <Dots active={1} />
      <ActionBar />
    </>
  );
}

/* A real BookSnap video summary: shows its poster frame, so the landing page
   never downloads the video itself. */
function WatchScreen() {
  const video = VIDEO_FEED[0];
  return (
    <div className="relative -mt-[12cqw] flex-1 overflow-hidden bg-black text-white">
      <motion.img
        src={video.poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
      <span className="absolute left-[4cqw] top-[14cqw] grid size-[9cqw] place-items-center rounded-full bg-[#888B8B]/80">
        <ChevronLeft aria-hidden className="size-[5cqw]" />
      </span>
      <span className="absolute right-[4cqw] top-[14cqw] grid size-[9cqw] place-items-center rounded-full bg-[#888B8B]/80">
        <Volume2 aria-hidden className="size-[4.6cqw]" />
      </span>
      <div className="absolute inset-x-[4cqw] top-[26cqw] h-[1cqw] overflow-hidden rounded-full bg-white/25">
        <motion.div className="h-full w-full origin-left rounded-full bg-[#EFB100]" initial={{ scaleX: 0.08 }} animate={{ scaleX: 0.45 }} transition={{ duration: 1.7, ease: "linear" }} />
      </div>
      <div className="absolute inset-x-[5cqw] bottom-[5cqw]">
        <div className="font-bold leading-tight">{video.title}</div>
        <div className="mt-[1cqw] flex items-center gap-[1.5cqw] text-[0.8em] text-white/75">
          {video.author} · <Play aria-hidden className="size-[2.8cqw] fill-current" /> Video summary
        </div>
      </div>
    </div>
  );
}

// A few of the app's Explore categories, for the mockup.
const APP_CATEGORIES = ["Non-fiction", "Adventure", "Historical", "Money & Wealth", "Upgrade Skill", "Drama", "Self-Improvement", "Romance", "Psychology", "Fiction"];

function ExploreScreen() {
  return (
    <div className="flex-1 overflow-hidden px-[5cqw]">
      <div className="flex items-center justify-between rounded-[2cqw] bg-[#45474B] px-[4cqw] py-[3cqw] text-[0.85em] text-[#C4C4C4]">
        Find your favorite book...
        <Search aria-hidden className="size-[4.6cqw] text-white" />
      </div>
      <div className="relative mt-[4cqw] overflow-hidden rounded-[4cqw]">
        <img src={VIDEO_BANNER} alt="" className="block h-[28cqw] w-full object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="mb-[1.5cqw] grid size-[10cqw] place-items-center rounded-full bg-[#3C6E57]">
            <Play aria-hidden className="ml-[0.5cqw] size-[5cqw] fill-current" />
          </span>
          <span className="text-[0.85em] font-bold">Video Summary</span>
          <span className="text-[0.7em] text-white/90">Watch short book summaries</span>
        </div>
      </div>
      <div className="mt-[4.5cqw] text-[1.05em] font-bold text-[#45474B]">Categories</div>
      <div className="mt-[2.5cqw] flex flex-wrap gap-[1.6cqw]">
        {APP_CATEGORIES.map((c) => {
          const Icon = categoryIcon(c);
          const on = c === "Romance";
          return (
            <span
              key={c}
              className="flex items-center gap-[1.2cqw] rounded-full border-[0.4cqw] px-[2.4cqw] py-[1cqw] text-[0.7em] font-medium"
              style={on ? { backgroundColor: "#3C6E57", borderColor: "#3C6E57", color: "#fff" } : { borderColor: "#3C6E57", color: "#2F5A47" }}
            >
              <Icon aria-hidden className="size-[3.2cqw] fill-current" strokeWidth={1.6} />
              {c}
            </span>
          );
        })}
      </div>
      <div className="mt-[4.5cqw] text-[1.05em] font-bold text-[#45474B]">Results</div>
      <div className="mt-[2.5cqw] grid grid-cols-3 gap-[3cqw]">
        {SHOWCASE.slice(3).concat(SHOWCASE.slice(0, 1)).map((b) => (
          <BookCover key={b.id} book={b} />
        ))}
      </div>
    </div>
  );
}

/* Ask AI chat, including the free tier's one-question limit, as in the app. */
function AskScreen() {
  const { book, ask } = FREE_SUMMARY;
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#E3E6E7]">
      <div className="flex items-center gap-[3cqw] rounded-b-[4cqw] bg-white px-[4cqw] pb-[3cqw] pt-[1cqw]">
        <ChevronLeft aria-hidden className="size-[5cqw] text-[#45474B]" />
        <BookCover book={book} className="w-[10cqw]" />
        <div className="min-w-0">
          <div className="truncate text-[0.95em] font-bold">{book.title}</div>
          <div className="flex items-center gap-[1.5cqw] text-[0.75em] font-medium text-[#D62E2E]">
            1/1 questions used <span className="size-[1.6cqw] rounded-full bg-[#3CC264]" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[3cqw] px-[4cqw] pt-[4cqw]">
        <motion.div
          className="ml-[10cqw] self-end rounded-[4cqw] bg-[#3C6E57] px-[3.5cqw] py-[2.5cqw] text-[0.82em] leading-snug text-white"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {ask[1].q}
        </motion.div>
        <motion.div
          className="mr-[10cqw] rounded-[4cqw] bg-white px-[3.5cqw] py-[2.5cqw] text-[0.82em] leading-snug"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <TypedText text={ask[1].a} />
        </motion.div>
      </div>
      <div className="mt-auto px-[4cqw] pb-[3cqw]">
        <motion.div
          className="flex items-center gap-[2cqw] rounded-[4cqw] border-[0.4cqw] border-[#E6B33D] bg-white p-[3cqw]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          <div className="min-w-0 flex-1">
            <div className="text-[0.85em] font-bold">Free limit reached</div>
            <div className="text-[0.72em] text-[#6B7280]">Upgrade to keep asking</div>
          </div>
          <span className="rounded-full bg-[#E6B33D] px-[3cqw] py-[1.5cqw] text-[0.75em] font-bold text-white">Upgrade</span>
        </motion.div>
        <div className="mt-[3cqw] flex items-center justify-between rounded-full bg-[#F1F2F3] py-[1cqw] pl-[4cqw] pr-[1cqw] text-[0.78em] text-[#A0A4A8]">
          Question limit reached
          <span className="grid size-[8cqw] place-items-center rounded-full bg-[#F2DFAE] text-[#9BB5A8]">
            <SendHorizontal aria-hidden className="size-[4cqw]" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* Profile, from the BookSnap design. The account shown is a sample persona. */
function ProfileScreen() {
  const sections: [string, [typeof UserRound, string][]][] = [
    ["User Information", [
      [UserRound, "User Profile"],
      [CreditCard, "Manage Subscription"],
      [BookOpen, "Reading Preference"],
      [Globe, "Language Preference"],
      [Heart, "Books You've Liked"],
      [Highlighter, "My Highlights"],
    ]],
    ["Help & Support", [
      [MessageCircleQuestion, "FAQs"],
      [Headset, "Customer Support"],
      [Info, "Accessibility"],
      [Settings, "Troubleshooting"],
    ]],
  ];
  return (
    <div className="flex-1 overflow-hidden bg-[#E3E6E7] px-[4cqw] pt-[1cqw]">
      <div className="flex items-center gap-[3cqw] rounded-[4.5cqw] bg-[#EDF5F0] p-[3cqw]">
        <img src={profileAvatar} alt="" className="size-[15cqw] shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <div className="truncate text-[0.95em] font-bold text-[#111827]">Alicia Wang</div>
          <div className="truncate text-[0.7em] text-[#6B7280]">alicia@example.com</div>
          <span className="mt-[1cqw] inline-block rounded-full bg-[#E8B53C] px-[2.6cqw] py-[0.6cqw] text-[0.68em] font-semibold text-[#1F4D3A]">Premium Plan</span>
        </div>
      </div>
      {sections.map(([title, rows]) => (
        <div key={title}>
          <div className="mt-[3.5cqw] text-[0.9em] font-semibold text-[#111827]">{title}</div>
          <div className="mt-[2cqw] rounded-[4.5cqw] bg-[#EDF5F0] px-[4cqw] py-[0.6cqw]">
            {rows.map(([Icon, label], i) => (
              <div key={label} className={`flex items-center gap-[3cqw] py-[2cqw] text-[0.76em] text-[#111827] ${i ? "border-t-[0.3cqw] border-[#3C6E57]" : ""}`}>
                <Icon aria-hidden className="size-[4.6cqw]" strokeWidth={1.5} />
                {label}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-[3.5cqw] flex items-center justify-center gap-[2cqw] rounded-full bg-[#3C6E57] py-[2.6cqw] text-[0.8em] font-medium text-white">
        Sign Out <LogOut aria-hidden className="size-[4cqw]" />
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
      tick = setInterval(() => {
        setN((c) => {
          const next = Math.min(text.length, c + 6);
          if (next === text.length) clearInterval(tick); // stop once fully typed
          return next;
        });
      }, 16);
    }, 150);
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

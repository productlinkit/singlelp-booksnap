import { useCallback, useEffect, useRef, useState, type ReactNode, type WheelEvent } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ChevronLeft, Highlighter, Lock, Play, Square, Volume2, X } from "lucide-react";
import { track } from "../analytics";
import { FREE_SUMMARY, SIGN_IN_URL, type Book } from "../content";
import { APP, BookCover, CtaButton } from "./ui";
import { screenMotion } from "./Funnel";

const ease = [0.16, 1, 0.3, 1] as const;
const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

/* The free summary, presented like the BookSnap app's reading screen: swipe
   through the pages, then the rest of the summary is behind the paywall. */
export function Reader({ onClose, onPaywall }: { onClose: () => void; onPaywall: (source: string) => void }) {
  const { book, pages, freePages } = FREE_SUMMARY;
  // Page 0 is the cover; summary pages follow. `gate` is where the preview stops.
  const total = pages.length + 1;
  const gate = freePages + 1;
  const [[page, dir], setPage] = useState<[number, number]>([0, 1]);
  const [login, setLogin] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  // Highlights the visitor made, per page, and the text currently selected.
  const [highlights, setHighlights] = useState<Record<number, string[]>>({});
  const [selection, setSelection] = useState<{ text: string; x: number; y: number; below: boolean } | null>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  // Mouse drags select text on desktop; touch swipes turn the page on phones.
  const [touch] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
  const [speaking, setSpeaking] = useState(false);
  const [large, setLarge] = useState(false); // "Aa": larger reading text
  const atGate = page === gate;

  const stopSpeech = useCallback(() => {
    if (canSpeak) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);
  useEffect(() => stopSpeech, [stopSpeech]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(gate, next));
      if (clamped === page) return;
      stopSpeech();
      if (clamped === gate) track("preview_complete", { book: book.id, pages: freePages });
      setPage([clamped, clamped > page ? 1 : -1]);
    },
    [book.id, freePages, gate, page, stopSpeech]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return login ? setLogin(false) : onClose();
      if (login) return;
      if (e.key === "ArrowRight") go(page + 1);
      if (e.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, page, onClose, login]);

  // Read the current page aloud with the browser's voice.
  const listen = () => {
    if (!canSpeak) return;
    if (speaking) return stopSpeech();
    track("feature_use", { feature: "listen", book: book.id });
    const u = new SpeechSynthesisUtterance(pages[page - 1].join(" "));
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const notify = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Track text the visitor selects inside the summary, to offer "Highlight".
  useEffect(() => {
    const onChange = () => {
      const sel = window.getSelection();
      const area = readingRef.current;
      if (!sel || sel.isCollapsed || !area || !sel.rangeCount) return setSelection(null);
      const range = sel.getRangeAt(0);
      if (!area.contains(range.commonAncestorContainer)) return setSelection(null);
      const text = sel.toString().replace(/\s+/g, " ").trim();
      if (text.length < 3) return setSelection(null);
      const r = range.getBoundingClientRect();
      const box = area.getBoundingClientRect();
      // Above the selection on desktop; below it on touch (the phone's own menu sits above) or when there's no room.
      const above = r.top - box.top - 10;
      const below = touch || above < 48;
      setSelection({ text, x: r.left + r.width / 2 - box.left, y: below ? r.bottom - box.top + 10 : above, below });
    };
    document.addEventListener("selectionchange", onChange);
    return () => document.removeEventListener("selectionchange", onChange);
  }, [touch]);
  useEffect(() => setSelection(null), [page]);

  const saveHighlight = () => {
    if (!selection) return;
    track("feature_use", { feature: "highlight", book: book.id });
    setHighlights((h) => ({ ...h, [page]: [...(h[page] ?? []), selection.text] }));
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    notify("Highlight saved.");
  };

  // Paragraph text with this page's highlights marked in yellow.
  const marked = (para: string) => {
    const list = (highlights[page] ?? []).filter((h) => para.includes(h));
    if (!list.length) return para;
    const re = new RegExp(`(${list.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
    return para.split(re).map((part, i) => (list.includes(part) ? <mark key={i} className="rounded-[3px] bg-[#FFE37A] px-0.5 text-inherit">{part}</mark> : part));
  };

  const openLogin = () => {
    stopSpeech();
    track("feature_use", { feature: "video", book: book.id });
    setLogin(true);
  };

  // Page dots. Dots past the gate are locked.
  const dots = (
    <nav aria-label="Summary pages" className="flex shrink-0 items-center justify-center py-1">
      {Array.from({ length: total }).map((_, i) => {
        const lockedPage = i > gate;
        return (
          <button
            key={i}
            type="button"
            onClick={() => (lockedPage ? onPaywall("preview_locked_page") : go(i))}
            aria-label={i === 0 ? "Cover" : lockedPage ? `Page ${i} of ${pages.length}, full access` : `Page ${i} of ${pages.length}`}
            aria-current={i === page ? "page" : undefined}
            className="grid h-11 w-6 cursor-pointer place-items-center"
          >
            {lockedPage ? (
              <Lock aria-hidden className="size-3 text-[#8A8A8A]" />
            ) : (
              <span className="block size-2 rounded-full transition-colors" style={{ backgroundColor: i === page ? APP.yellow : "#3F4A45" }} />
            )}
          </button>
        );
      })}
    </nav>
  );

  // A short drag or a quick flick turns the page.
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -40 || velocity.x < -350) go(page + 1);
    else if (offset.x > 40 || velocity.x > 350) go(page - 1);
  };

  // Two-finger sideways swipe on a trackpad (or shift + wheel) turns the page too.
  const wheelLock = useRef(0);
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) < 25 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    const now = Date.now();
    if (now < wheelLock.current) return;
    wheelLock.current = now + 650;
    go(page + (e.deltaX > 0 ? 1 : -1));
  };

  return (
    <motion.div {...screenMotion} role="dialog" aria-modal="true" aria-label={`${book.title} free summary`} className="fixed inset-0 flex justify-center bg-cream">
      {/* App column: full-bleed on phones, a phone-width column on desktop */}
      <div className="relative flex h-full w-full max-w-[520px] flex-col overflow-hidden bg-white pb-[max(12px,env(safe-area-inset-bottom))] sm:shadow-[0_0_80px_-30px_rgba(0,54,37,0.35)]" style={{ color: APP.ink }}>
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between gap-2 px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))]">
          <RoundButton label="Close summary" onClick={onClose} tint="#DDE6E1">
            <X className="size-5" style={{ color: APP.greenDark }} />
          </RoundButton>
          <RoundButton label={large ? "Smaller text" : "Larger text"} onClick={() => setLarge((l) => !l)} tint="#E6F2EC" pressed={large}>
            <span className="text-[15px] font-extrabold" style={{ color: APP.greenDark }}>Aa</span>
          </RoundButton>
        </header>

        {/* Reading area: swipe or use the dots / arrow keys */}
        <div ref={readingRef} className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.article
              key={page}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              drag={touch ? "x" : false}
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: atGate ? 0.15 : 0.7, right: page === 0 ? 0.15 : 0.7 }}
              dragTransition={{ bounceStiffness: 500, bounceDamping: 35 }}
              onDragEnd={onDragEnd}
              onWheel={onWheel}
              className={`absolute inset-0 ${page === 0 ? "px-4 pb-1" : `overflow-y-auto px-6 pt-2 sm:px-8 ${atGate ? "pb-3" : "pb-32"}`}`}
              aria-live="polite"
            >
              {page === 0 ? (
                <Cover book={book} onStart={() => go(1)}>{dots}</Cover>
              ) : atGate ? (
                <Gate book={book} paragraphs={pages[freePages]} large={large} left={pages.length - freePages} onUnlock={() => onPaywall(`preview_gate_${book.id}`)} />
              ) : (
                pages[page - 1].map((para, i) => (
                  <p key={i} className={`${i ? "mt-6" : ""} ${large ? "text-[21px]" : "text-[18px]"} leading-[1.65] transition-[font-size]`}>
                    {marked(para)}
                  </p>
                ))
              )}
            </motion.article>
          </AnimatePresence>

          {/* Highlight + listen buttons, as in the app (text pages only) */}
          {page > 0 && !atGate && (
            <div className="absolute bottom-3 right-4 z-10 flex flex-col gap-3">
              <RoundButton label="Highlight" onClick={() => (selection ? saveHighlight() : notify("Select any text to highlight it."))} tint="#FFFFFF" shadow pressed={!!selection}>
                <Highlighter className="size-5" style={{ color: APP.greenDark }} />
              </RoundButton>
              {canSpeak && (
                <RoundButton label={speaking ? "Stop listening" : "Listen to this page"} onClick={listen} tint={APP.yellow} shadow pressed={speaking}>
                  {speaking ? <Square className="size-4 fill-current" style={{ color: APP.greenDark }} /> : <Volume2 className="size-5" style={{ color: APP.greenDark }} />}
                </RoundButton>
              )}
            </div>
          )}

          {/* "Highlight" pops up next to selected text */}
          <AnimatePresence>
            {selection && (
              <motion.button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={saveHighlight}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute z-30 flex min-h-10 -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-full bg-forest px-4 text-[14px] font-bold text-white shadow-xl ${selection.below ? "" : "-translate-y-full"}`}
                style={{ left: Math.min(Math.max(selection.x, 70), (readingRef.current?.clientWidth ?? 400) - 70), top: selection.y }}
              >
                <Highlighter aria-hidden className="size-4 text-gold" /> Highlight
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {toast && (
              <motion.div
                role="status"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="absolute bottom-3 left-4 z-20 rounded-2xl bg-forest px-4 py-3 text-[14px] font-semibold text-white shadow-xl"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Page dots below the text (on the cover they sit inside the card) */}
        {page > 0 && dots}

        {/* Video summary card, below the page dots as in the app */}
        {page > 0 && !atGate && <VideoCard book={book} onPlay={openLogin} />}

        <AnimatePresence>
          {login && (
            <SheetPanel key="login" title="Video Summary" onClose={() => setLogin(false)}>
              <div className="flex flex-col items-center text-center">
                <span className="grid size-14 place-items-center rounded-full bg-[#3C6E57] text-white">
                  <Play aria-hidden className="ml-0.5 size-6 fill-current" />
                </span>
                <p className="mt-3 font-display text-[21px] font-extrabold leading-tight">Log in to watch video summaries</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#4A4A4A]">Short video breakdowns of every book are part of your BookSnap account.</p>
              </div>
              <CtaButton onClick={() => onPaywall("video_login")} className="mt-5 w-full px-6 py-4 text-[16px]">Start Free Trial</CtaButton>
              <a
                href={SIGN_IN_URL}
                className="mt-2 flex min-h-12 w-full items-center justify-center rounded-full border text-[15px] font-bold"
                style={{ borderColor: APP.greenDark, color: APP.greenDark }}
              >
                I already have an account · Log in
              </a>
            </SheetPanel>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* Opening slide: the full book cover, as the BookSnap app shows it before the
   text. The art is never cropped: the card takes the cover's own background
   color, so it reads as one cover at any screen shape. */
function Cover({ book, onStart, children }: { book: Book; onStart: () => void; children: ReactNode }) {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[28px] shadow-[0_12px_30px_-14px_rgba(0,0,0,0.4)]"
      style={{ backgroundColor: book.color }}
    >
      <motion.img
        src={book.cover}
        alt={`${book.title} by ${book.author}`}
        draggable={false}
        className="min-h-0 w-full flex-1 select-none object-contain"
        initial={{ scale: 1.04, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
      />
      <div className="flex shrink-0 flex-col items-center gap-1 px-4 pb-1 pt-2">
        <button
          type="button"
          onClick={onStart}
          className="flex min-h-12 cursor-pointer items-center gap-3 rounded-full border border-white/25 bg-black/30 px-6 text-[17px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/40"
        >
          Swipe to Read
          <span aria-hidden className="flex">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="-ml-2 first:ml-0"
                animate={{ x: [0, -4, 0], opacity: [1 - i * 0.3, 1, 1 - i * 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
              >
                <ChevronLeft className="size-5" />
              </motion.span>
            ))}
          </span>
        </button>
        <div className="w-full [&_svg]:!text-white">{children}</div>
      </div>
    </div>
  );
}

/* Where the free preview stops: the next page starts, then fades into blur. */
function Gate({ book, paragraphs, large, left, onUnlock }: { book: Book; paragraphs: string[]; large: boolean; left: number; onUnlock: () => void }) {
  const size = large ? "text-[21px]" : "text-[18px]";
  return (
    <div>
      <p className={`${size} leading-[1.65]`}>{paragraphs[0]}</p>
      <div aria-hidden className="relative mt-6 select-none">
        {paragraphs.slice(1).map((para, i) => (
          <p key={i} className={`${size} leading-[1.65] blur-[6px]`}>{para}</p>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white" />
      </div>
      {/* Sticky so the next step stays in view on short screens */}
      <div className="sticky bottom-0 -mx-6 bg-gradient-to-t from-white from-80% to-transparent px-6 pb-1 pt-6 sm:-mx-8 sm:px-8">
        <div className="rounded-[24px] bg-forest p-5 text-white [@media(max-height:700px)]:p-4">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[0.14em] text-gold">
            <Lock aria-hidden className="size-3.5" /> End of free preview
          </span>
          <p className="mt-2 font-display text-[22px] font-extrabold leading-tight [@media(max-height:700px)]:text-[19px]">Want the rest of the story?</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-white/75 [@media(max-height:700px)]:hidden">
            {left} more {left === 1 ? "page" : "pages"} of {book.title}, plus every other summary in the library.
          </p>
          <CtaButton tone="gold" onClick={onUnlock} className="mt-4 w-full px-6 py-4 text-[16px] [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:py-3.5">Continue Reading</CtaButton>
          <a href={SIGN_IN_URL} className="mt-1 flex min-h-11 items-center justify-center text-[14px] font-semibold text-white/85 underline underline-offset-4 hover:text-white">
            Already have an account? Log in
          </a>
        </div>
      </div>
    </div>
  );
}

/* "Video summary available" card, as the app shows it under a summary. */
function VideoCard({ book, onPlay }: { book: Book; onPlay: () => void }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="mx-4 mt-1 flex shrink-0 cursor-pointer items-center gap-3 rounded-2xl bg-[#2F6B55] p-2.5 pr-3 text-left shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)] transition-colors hover:bg-[#2A604C]"
    >
      <BookCover book={book} className="w-10 shrink-0 rounded-md [@media(max-height:700px)]:w-7" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-bold text-white">Video summary available</span>
        <span className="mt-0.5 block truncate text-[12.5px] text-white/85 [@media(max-height:700px)]:hidden">Watch visual breakdown now</span>
      </span>
      <span className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#F2B705] px-4 text-[14px] font-bold text-[#1F2A24] max-[380px]:px-3">
        <Play aria-hidden className="size-3.5 fill-current" /> <span className="max-[380px]:sr-only">Play</span>
      </span>
    </button>
  );
}


function SheetPanel({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <motion.div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-black/40" />
      <motion.section
        role="dialog"
        aria-label={title}
        initial={{ y: 16, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 16, scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.3, ease }}
        className="relative max-h-full w-full max-w-[480px] overflow-y-auto rounded-[28px] bg-white px-5 pb-5 pt-4 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-extrabold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-black/5">
            <X aria-hidden className="size-5" />
          </button>
        </div>
        {children}
      </motion.section>
    </motion.div>
  );
}

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 80 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.32, ease } },
  exit: (d: number) => ({ opacity: 0, x: d * -80, transition: { duration: 0.2 } }),
};

function RoundButton({ label, onClick, tint, shadow, pressed, children }: { label: string; onClick: () => void; tint: string; shadow?: boolean; pressed?: boolean; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className={`grid size-12 shrink-0 cursor-pointer place-items-center rounded-full ${shadow ? "shadow-[0_6px_16px_rgba(0,0,0,0.16)]" : ""}`}
      style={{ backgroundColor: tint }}
    >
      {children}
    </motion.button>
  );
}



import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import {
  Bookmark, ChevronLeft, ChevronRight, Heart, Lock, MessageCircle,
  PenLine, Play, Share2, Square, Volume2, X,
} from "lucide-react";
import { track } from "../analytics";
import { FREE_SUMMARY, SIGN_IN_URL, type Book } from "../content";
import { APP, BookCover, CtaButton } from "./ui";
import { screenMotion } from "./Funnel";

const ease = [0.16, 1, 0.3, 1] as const;
const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

type Sheet = "comments" | "note" | "login" | null;

/* The free summary, presented like the BookSnap app's reading screen. As on
   Deepstash, every feature can be tried for real (like, save, comment,
   notes); what's limited is the reading: after a few free pages the
   rest of the summary is behind the paywall. Everything a visitor does here
   lives in memory only. */
export function Reader({ onClose, onPaywall }: { onClose: () => void; onPaywall: (source: string) => void }) {
  const { book, pages, freePages } = FREE_SUMMARY;
  const gate = freePages; // index of the page where the preview stops
  const [[page, dir], setPage] = useState<[number, number]>([0, 1]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [speaking, setSpeaking] = useState(false);
  const [large, setLarge] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const atGate = page === gate;

  const notify = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };
  const used = (feature: string) => track("feature_use", { feature, book: book.id });

  const stopSpeech = useCallback(() => {
    if (canSpeak) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

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
      if (e.key === "Escape") return sheet ? setSheet(null) : onClose();
      if (sheet) return;
      if (e.key === "ArrowRight") go(page + 1);
      if (e.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, page, onClose, sheet]);

  useEffect(() => () => {
    stopSpeech();
    window.clearTimeout(toastTimer.current);
  }, [stopSpeech]);

  const openSheet = (s: Exclude<Sheet, null>) => {
    stopSpeech();
    used(s);
    setSheet(s);
  };

  const listen = () => {
    if (!canSpeak) return;
    if (speaking) return stopSpeech();
    used("listen");
    const u = new SpeechSynthesisUtterance(pages[page].join(" "));
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const share = async () => {
    used("share");
    const data = { title: `${book.title}, free summary on BookSnap`, url: window.location.origin };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        notify("Link copied.");
      }
    } catch {
      /* user cancelled the share sheet */
    }
  };

  const toggleLike = () => {
    if (!liked) used("like");
    setLiked(!liked);
    notify(liked ? "Removed from liked." : "Liked.");
  };
  const toggleSave = () => {
    if (!saved) used("save");
    setSaved(!saved);
    notify(saved ? "Removed from saved." : "Saved.");
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -70) go(page + 1);
    else if (info.offset.x > 70) go(page - 1);
  };

  return (
    <motion.div {...screenMotion} role="dialog" aria-modal="true" aria-label={`${book.title} free summary`} className="fixed inset-0 flex justify-center bg-cream">
      {/* App column: full-bleed on phones, a phone-width column on desktop */}
      <div className="relative flex h-full w-full max-w-[520px] flex-col overflow-hidden bg-white sm:shadow-[0_0_80px_-30px_rgba(0,54,37,0.35)]" style={{ color: APP.ink }}>
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between gap-2 px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))]">
          <RoundButton label="Close summary" onClick={onClose} tint="#DDE6E1">
            <X className="size-5" style={{ color: APP.greenDark }} />
          </RoundButton>
          <RoundButton label={large ? "Smaller text" : "Larger text"} onClick={() => setLarge((l) => !l)} tint="#E6F2EC" pressed={large}>
            <span className="text-[15px] font-extrabold" style={{ color: APP.greenDark }}>Aa</span>
          </RoundButton>
        </header>

        {/* Reading area */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.article
                key={page}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={onDragEnd}
                className={`absolute inset-0 overflow-y-auto px-6 pt-2 sm:px-8 ${atGate ? "pb-3" : "pb-28"}`}
                aria-live="polite"
              >
                {page === 0 && (
                  <div className="mb-5 flex items-center gap-4">
                    <BookCover book={book} className="w-[60px] shrink-0" />
                    <div className="min-w-0">
                      <h2 className="font-display text-[22px] font-extrabold leading-tight">{book.title}</h2>
                      <p className="text-[14px] text-[#5F5F5F]">{book.author}</p>
                    </div>
                  </div>
                )}
                {atGate ? (
                  <Gate book={book} paragraphs={pages[gate]} large={large} left={pages.length - freePages} onUnlock={() => onPaywall(`preview_gate_${book.id}`)} />
                ) : (
                  <>
                    {pages[page].map((para, i) => (
                      <p key={i} className={`${i ? "mt-6" : ""} ${large ? "text-[21px]" : "text-[18px]"} leading-[1.65] transition-[font-size]`}>
                        {para}
                      </p>
                    ))}
                    {page === 0 && <VideoCard book={book} onPlay={() => openSheet("login")} />}
                  </>
                )}
              </motion.article>
            </AnimatePresence>

          {/* Floating note + listen buttons, as in the app */}
          {!atGate && (
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-3">
              <RoundButton label="Add a note" onClick={() => openSheet("note")} tint="#FFFFFF" shadow>
                <PenLine className="size-5" style={{ color: APP.greenDark }} />
              </RoundButton>
              {canSpeak && (
                <RoundButton label={speaking ? "Stop listening" : "Listen to this page"} onClick={listen} tint={APP.yellow} shadow pressed={speaking}>
                  {speaking ? <Square className="size-4 fill-current" style={{ color: APP.greenDark }} /> : <Volume2 className="size-5" style={{ color: APP.greenDark }} />}
                </RoundButton>
              )}
            </div>
          )}

          <AnimatePresence>
            {toast && (
              <motion.div
                role="status"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="absolute bottom-4 left-4 z-20 rounded-2xl bg-forest px-4 py-3 text-[14px] font-semibold text-white shadow-xl"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Page navigation: arrows + dots. Dots past the gate are locked. */}
        <nav aria-label="Summary pages" className="flex shrink-0 items-center justify-center gap-2 px-4 py-2">
          <button type="button" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Previous page" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-black/5 disabled:cursor-default disabled:opacity-30">
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <div className="flex items-center">
            {pages.map((_, i) => {
              const lockedPage = i > gate;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => (lockedPage ? onPaywall("preview_locked_page") : go(i))}
                  aria-label={lockedPage ? `Page ${i + 1} of ${pages.length}, full access` : `Page ${i + 1} of ${pages.length}`}
                  aria-current={i === page ? "page" : undefined}
                  className={`grid h-11 cursor-pointer place-items-center ${i === page ? "w-10" : "w-7"} transition-all`}
                >
                  {lockedPage ? (
                    <Lock aria-hidden className="size-3" style={{ color: "#8A8A8A" }} />
                  ) : (
                    <span className={`block h-2 rounded-full transition-all ${i === page ? "w-6" : "w-2"}`} style={{ backgroundColor: i === page ? APP.yellow : "#8A8A8A" }} />
                  )}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => go(page + 1)} disabled={atGate} aria-label="Next page" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-black/5 disabled:cursor-default disabled:opacity-30">
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </nav>

        {/* Action bar (no counts: there's nothing real to count yet) */}
        <div className={`mx-4 mb-[max(12px,env(safe-area-inset-bottom))] flex shrink-0 items-center justify-around rounded-full py-1`} style={{ backgroundColor: APP.yellow }}>
          <ActionButton label="Like" pressed={liked} onClick={toggleLike}>
            <Heart className="size-6" style={{ color: APP.greenDark, fill: liked ? APP.greenDark : "transparent" }} strokeWidth={2.2} />
          </ActionButton>
          <ActionButton label={`Comments${comments.length ? ` (${comments.length})` : ""}`} onClick={() => openSheet("comments")}>
            <MessageCircle className="size-6" style={{ color: APP.greenDark, fill: comments.length ? APP.greenDark : "transparent" }} strokeWidth={2.2} />
          </ActionButton>
          <ActionButton label="Share" onClick={share}><Share2 className="size-6" style={{ color: APP.greenDark }} strokeWidth={2.2} /></ActionButton>
          <ActionButton label="Save" pressed={saved} onClick={toggleSave}>
            <Bookmark className="size-6" style={{ color: APP.greenDark, fill: saved ? APP.greenDark : "transparent" }} strokeWidth={2.2} />
          </ActionButton>
        </div>

        {/* Bottom sheets for each feature */}
        <AnimatePresence>
          {sheet === "note" && (
            <SheetPanel key="note" title="Add a note" onClose={() => setSheet(null)}>
              <Composer
                placeholder="What stood out to you on this page?"
                cta="Save note"
                onSubmit={() => {
                  setSheet(null);
                  notify("Note saved.");
                }}
              />
              <p className="mt-2 text-[13px] text-[#5F5F5F]">Page {page + 1} of {book.title}</p>
            </SheetPanel>
          )}
          {sheet === "comments" && (
            <SheetPanel key="comments" title="Comments" onClose={() => setSheet(null)}>
              {comments.length ? (
                <ul className="mb-4 flex max-h-[36vh] flex-col gap-3 overflow-y-auto">
                  {comments.map((c, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white" style={{ backgroundColor: APP.greenDark }}>You</span>
                      <p className="rounded-2xl bg-[#F2F2F2] px-3.5 py-2.5 text-[15px] leading-snug">{c}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-4 text-[15px] text-[#5F5F5F]">No comments yet. Share your take on {book.title}.</p>
              )}
              <Composer placeholder="Write a comment" cta="Post" onSubmit={(text) => setComments((c) => [...c, text])} />
              <p className="mt-2 text-[12.5px] text-[#5F5F5F]">Only you can see your comments.</p>
            </SheetPanel>
          )}
          {sheet === "login" && (
            <SheetPanel key="login" title="Video Summary" onClose={() => setSheet(null)}>
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
    <button type="button" onClick={onPlay} className="mt-6 flex w-[calc(100%-52px)] cursor-pointer items-center gap-3 rounded-2xl bg-[#1A1A1A] p-3 text-left">
      <span className="relative w-11 shrink-0 overflow-hidden rounded-md">
        <BookCover book={book} className="w-full" />
        <span className="absolute inset-0 grid place-items-center bg-black/35">
          <Play aria-hidden className="size-4 fill-white text-white" />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-bold text-white">Video summary</span>
        <span className="mt-0.5 block truncate text-[12.5px] text-white/80">Watch the breakdown</span>
      </span>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#1A1A1A]">
        <Play aria-hidden className="ml-0.5 size-4 fill-current" />
      </span>
    </button>
  );
}

function Composer({ placeholder, cta, onSubmit }: { placeholder: string; cta: string; onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text.trim());
        setText("");
      }}
    >
      <label className="sr-only" htmlFor="composer">{placeholder}</label>
      <textarea
        id="composer"
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-[18px] border border-[#CFCFCF] p-3.5 text-[16px] leading-snug outline-none focus:border-forest"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="mt-2 min-h-11 w-full cursor-pointer rounded-full text-[15px] font-bold text-white disabled:cursor-default disabled:opacity-40"
        style={{ backgroundColor: APP.greenDark }}
      >
        {cta}
      </button>
    </form>
  );
}

function SheetPanel({ title, icon, onClose, closeLabel, children }: { title: string; icon?: ReactNode; onClose: () => void; closeLabel?: string; children: ReactNode }) {
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
          <h2 className="flex items-center gap-2 text-[18px] font-extrabold">{icon}{title}</h2>
          <button type="button" onClick={onClose} aria-label={closeLabel ?? "Close"} className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-black/5">
            {closeLabel ? <ChevronLeft aria-hidden className="size-5" /> : <X aria-hidden className="size-5" />}
          </button>
        </div>
        {children}
      </motion.section>
    </motion.div>
  );
}

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 48 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
  exit: (d: number) => ({ opacity: 0, x: d * -48, transition: { duration: 0.25 } }),
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

function ActionButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button type="button" aria-label={label} aria-pressed={pressed} onClick={onClick} whileTap={{ scale: 0.8 }} className="grid size-12 cursor-pointer place-items-center rounded-full hover:bg-black/5">
      {children}
    </motion.button>
  );
}


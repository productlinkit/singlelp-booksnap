import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import {
  Bookmark, ChevronLeft, ChevronRight, Heart, House, Lightbulb, Lock, MessageCircle,
  CreditCard, Highlighter, Pause, PenLine, Play, Search, SendHorizontal, Share2, Sparkles, Square, UserRound, Volume2, VolumeX, X,
} from "lucide-react";
import { track } from "../analytics";
import { CATEGORIES, FREE_SUMMARY, SHOWCASE, VIDEO_BANNER, VIDEO_FEED, VIDEO_TEASER_SECONDS, type Book, type VideoItem } from "../content";
import { APP, BookCover, categoryIcon, CtaButton } from "./ui";
import { screenMotion } from "./Funnel";

const ease = [0.16, 1, 0.3, 1] as const;
const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

type Note = { page: number; text: string };
type Sheet = "comments" | "note" | "ask" | "profile" | null;

/* The free summary, presented like the BookSnap app's reading screen. As on
   Deepstash, every feature can be tried for real (like, save, comment, notes,
   Ask AI, explore, video summaries); what's limited is the reading: after FREE_PAGES pages the
   rest of the summary is behind the paywall. Everything a visitor does here
   lives in memory only. */
export function Reader({ onClose, onPaywall }: { onClose: () => void; onPaywall: (source: string) => void }) {
  const { book, pages, freePages, ask } = FREE_SUMMARY;
  const gate = freePages; // index of the page where the preview stops
  const [[page, dir], setPage] = useState<[number, number]>([0, 1]);
  const [tab, setTab] = useState<"summary" | "library" | "explore">("summary");
  const [detail, setDetail] = useState<Book | null>(null);
  const [video, setVideo] = useState<number | null>(null); // index into VIDEO_FEED
  const [sheet, setSheet] = useState<Sheet>(null);
  const [speaking, setSpeaking] = useState(false);
  const [large, setLarge] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [comments, setComments] = useState<string[]>([]);
  const [asked, setAsked] = useState<number | null>(null); // the one free Ask AI question
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>();
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
      if (e.key === "Escape") {
        if (video !== null) return setVideo(null);
        if (detail) return setDetail(null);
        return sheet ? setSheet(null) : onClose();
      }
      if (sheet || detail || video !== null || tab !== "summary") return;
      if (e.key === "ArrowRight") go(page + 1);
      if (e.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, page, onClose, sheet, tab, detail, video]);

  useEffect(() => () => {
    stopSpeech();
    window.clearTimeout(toastTimer.current);
  }, [stopSpeech]);

  const openTab = (t: typeof tab) => {
    if (t !== "summary" && t !== tab) used(t);
    stopSpeech();
    setSheet(null);
    setTab(t);
  };
  const playVideo = (bookId: string) => {
    stopSpeech();
    setDetail(null);
    setVideo(Math.max(0, VIDEO_FEED.findIndex((v) => v.id === bookId)));
  };

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
    notify(saved ? "Removed from your library." : "Saved to your library.");
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
          <div role="tablist" aria-label="View" className="flex rounded-[12px] p-1 text-[14px] font-bold text-white" style={{ backgroundColor: APP.chrome }}>
            {(["summary", "library"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => openTab(t)}
                className="cursor-pointer whitespace-nowrap rounded-[9px] px-3 py-2.5 font-bold transition-colors hover:bg-white/10 min-[400px]:px-4"
                style={tab === t ? { backgroundColor: APP.greenDark } : undefined}
              >
                {t === "summary" ? "Summary" : "My Library"}
              </button>
            ))}
          </div>
          <RoundButton label={large ? "Smaller text" : "Larger text"} onClick={() => setLarge((l) => !l)} tint="#E6F2EC" pressed={large}>
            <span className="text-[15px] font-extrabold" style={{ color: APP.greenDark }}>Aa</span>
          </RoundButton>
        </header>

        {/* Reading area */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {tab === "library" ? (
            <Library book={book} saved={saved} notes={notes} onRead={(p) => { setTab("summary"); go(p); }} onExplore={() => openTab("explore")} />
          ) : tab === "explore" ? (
            <Explore onBook={(b) => (b.id === book.id ? openTab("summary") : setDetail(b))} onVideos={() => playVideo(VIDEO_FEED[0].id)} />
          ) : (
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
                  <Gate paragraphs={pages[gate]} large={large} left={pages.length - freePages} onUnlock={() => onPaywall("preview_gate")} />
                ) : (
                  <>
                    {pages[page].map((para, i) => (
                      <p key={i} className={`${i ? "mt-6" : ""} ${large ? "text-[21px]" : "text-[18px]"} leading-[1.65] transition-[font-size]`}>
                        {para}
                      </p>
                    ))}
                    {page === 0 && <VideoCard book={book} onPlay={() => playVideo(book.id)} />}
                  </>
                )}
              </motion.article>
            </AnimatePresence>
          )}

          {/* Floating note + listen buttons, as in the app */}
          {tab === "summary" && !atGate && (
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
        {tab === "summary" && (
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
        )}

        {/* Action bar (no counts: there's nothing real to count yet) */}
        {tab !== "explore" && (
        <div className={`mx-4 mb-3 flex shrink-0 items-center justify-around rounded-full py-1 ${tab === "library" ? "mt-3" : ""}`} style={{ backgroundColor: APP.yellow }}>
          <ActionButton label="Like" pressed={liked} onClick={toggleLike}>
            <Heart className="size-6" style={{ color: APP.greenDark, fill: liked ? APP.greenDark : "transparent" }} strokeWidth={2.2} />
          </ActionButton>
          <ActionButton label={`Comments${comments.length ? ` (${comments.length})` : ""}`} onClick={() => openSheet("comments")}>
            <MessageCircle className="size-6" style={{ color: APP.greenDark, fill: comments.length ? APP.greenDark : "transparent" }} strokeWidth={2.2} />
          </ActionButton>
          <ActionButton label="Share" onClick={share}><Share2 className="size-6" style={{ color: APP.greenDark }} strokeWidth={2.2} /></ActionButton>
          <ActionButton label="Save to library" pressed={saved} onClick={toggleSave}>
            <Bookmark className="size-6" style={{ color: APP.greenDark, fill: saved ? APP.greenDark : "transparent" }} strokeWidth={2.2} />
          </ActionButton>
        </div>
        )}

        {/* Bottom nav */}
        <nav aria-label="BookSnap app" className="flex shrink-0 items-start justify-around pb-[max(10px,env(safe-area-inset-bottom))] pt-1" style={{ backgroundColor: APP.chrome }}>
          <NavItem icon={House} label="Home" active={!sheet && tab !== "explore"} onClick={() => openTab("summary")} />
          <NavItem icon={Search} label="Explore" active={!sheet && tab === "explore"} onClick={() => openTab("explore")} />
          <NavItem icon={Lightbulb} label="ASK.AI" active={sheet === "ask"} onClick={() => openSheet("ask")} />
          <NavItem icon={UserRound} label="Profile" active={sheet === "profile"} onClick={() => openSheet("profile")} />
        </nav>

        {/* Bottom sheets for each feature */}
        <AnimatePresence>
          {sheet === "note" && (
            <SheetPanel key="note" title="Add a note" onClose={() => setSheet(null)}>
              <Composer
                placeholder="What stood out to you on this page?"
                cta="Save note"
                onSubmit={(text) => {
                  setNotes((n) => [...n, { page, text }]);
                  setSheet(null);
                  notify("Note saved to your library.");
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
              <p className="mt-2 text-[12.5px] text-[#5F5F5F]">Preview: only you can see this.</p>
            </SheetPanel>
          )}
          {sheet === "ask" && (
            <AskSheet
              key="ask"
              ask={ask}
              asked={asked}
              onAsk={(i) => {
                used("ask_ai_question");
                setAsked(i);
              }}
              onClose={() => setSheet(null)}
              onPaywall={onPaywall}
            />
          )}
          {detail && (
            <BookSheet
              key={detail.id}
              book={detail}
              onClose={() => setDetail(null)}
              onRead={() => onPaywall(`explore_${detail.id}`)}
              onWatch={() => playVideo(detail.id)}
            />
          )}
          {sheet === "profile" && (
            <SheetPanel key="profile" title="Profile" onClose={() => setSheet(null)}>
              <div className="flex items-center gap-4 rounded-[20px] bg-[#ECF5EF] p-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#E07A2F] text-[28px] text-white">G</span>
                <div className="min-w-0">
                  <p className="text-[18px] font-bold text-[#111827]">Guest</p>
                  <p className="text-[14px] text-[#5F6670]">Not signed in</p>
                  <span className="mt-1.5 inline-block rounded-full bg-[#FBDC5E] px-3 py-1 text-[13px] font-semibold text-[#2F5A47]">Free Preview</span>
                </div>
              </div>
              <ul className="mt-4 divide-y divide-white overflow-hidden rounded-[20px] bg-[#ECF5EF]">
                {([
                  [Heart, "Book You've Liked", liked ? "1" : "0", () => openTab("library")],
                  [Bookmark, "Saved", saved ? "1" : "0", () => openTab("library")],
                  [Highlighter, "My Notes", String(notes.length), () => openTab("library")],
                  [CreditCard, "Manage Subscription", "", () => onPaywall("profile_subscription")],
                ] as [typeof Heart, string, string, () => void][]).map(([Icon, label, count, onClick]) => (
                  <li key={label}>
                    <button type="button" onClick={onClick} className="flex min-h-12 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-[15px] text-[#111827] hover:bg-white/50">
                      <Icon aria-hidden className="size-5" strokeWidth={1.7} />
                      <span className="flex-1">{label}</span>
                      {count && <span className="text-[14px] font-semibold text-[#5F6670]">{count}</span>}
                      <ChevronRight aria-hidden className="size-4 text-[#9A9A9A]" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14.5px] leading-relaxed text-[#4A4A4A]">What you save in this preview disappears when you leave. Start your free trial to keep your library and notes.</p>
              <CtaButton onClick={() => onPaywall("profile")} className="mt-3 w-full px-6 py-4 text-[16px]">Keep My Library</CtaButton>
            </SheetPanel>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {video !== null && (
            <VideoFeed
              start={video}
              onClose={() => setVideo(null)}
              onRead={() => {
                setVideo(null);
                openTab("summary");
              }}
              onPlay={(id) => used(`video_${id}`)}
              onPaywall={(id) => onPaywall(`video_${id}`)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* Where the free preview stops: the next page starts, then fades into blur. */
function Gate({ paragraphs, large, left, onUnlock }: { paragraphs: string[]; large: boolean; left: number; onUnlock: () => void }) {
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
            {left} more {left === 1 ? "page" : "pages"} of {FREE_SUMMARY.book.title}, plus every other summary in the library.
          </p>
          <CtaButton tone="gold" onClick={onUnlock} className="mt-4 w-full px-6 py-4 text-[16px] [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:py-3.5">Continue Reading</CtaButton>
        </div>
      </div>
    </div>
  );
}

function Library({ book, saved, notes, onRead, onExplore }: { book: Book; saved: boolean; notes: Note[]; onRead: (page: number) => void; onExplore: () => void }) {
  const empty = !saved && !notes.length;
  return (
    <div className="h-full overflow-y-auto px-6 pb-6 pt-2 sm:px-8">
      <h2 className="font-display text-[22px] font-extrabold">My Library</h2>
      {empty ? (
        <div className="mt-6 rounded-[24px] bg-[#F2F2F2] p-5 text-center">
          <Bookmark aria-hidden className="mx-auto size-7" style={{ color: APP.greenDark }} />
          <p className="mt-3 text-[15px] leading-relaxed text-[#4A4A4A]">Tap the bookmark to save a summary, or the pen to add a note. They'll show up here.</p>
          <button type="button" onClick={onExplore} className="mt-3 min-h-11 cursor-pointer px-3 text-[15px] font-bold underline underline-offset-4" style={{ color: APP.greenDark }}>
            Explore books
          </button>
        </div>
      ) : (
        <>
          {saved && (
            <button type="button" onClick={() => onRead(0)} className="mt-4 flex w-full cursor-pointer items-center gap-4 rounded-[20px] bg-[#F2F2F2] p-3 text-left hover:bg-[#EAEAEA]">
              <BookCover book={book} className="w-12 shrink-0" />
              <span className="min-w-0">
                <span className="block text-[16px] font-bold">{book.title}</span>
                <span className="block text-[14px] text-[#5F5F5F]">{book.author}</span>
              </span>
            </button>
          )}
          {notes.length > 0 && (
            <>
              <h3 className="mt-6 text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#5F5F5F]">Notes</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {notes.map((n, i) => (
                  <li key={i}>
                    <button type="button" onClick={() => onRead(n.page)} className="w-full cursor-pointer rounded-[20px] border border-[#E2E2E2] p-4 text-left hover:bg-[#F7F7F7]">
                      <span className="block text-[15px] leading-snug">{n.text}</span>
                      <span className="mt-1.5 block text-[13px] text-[#5F5F5F]">{book.title} · page {n.page + 1}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* Ask AI chat, styled like the app. As on BookSnap's free tier, one question
   per book is free; after that the limit card points to full access. Answers
   to the suggested questions are prepared in content.ts. */
function AskSheet({ ask, asked, onAsk, onClose, onPaywall }: { ask: { q: string; a: string }[]; asked: number | null; onAsk: (i: number) => void; onClose: () => void; onPaywall: (source: string) => void }) {
  const { book } = FREE_SUMMARY;
  const used = asked === null ? 0 : 1;
  return (
    <SheetPanel title="Ask AI" icon={<Sparkles aria-hidden className="size-5 text-gold-ink" />} onClose={onClose}>
      <div className="flex items-center gap-3">
        <BookCover book={book} className="w-10 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold">{book.title}</p>
          <p className={`flex items-center gap-1.5 text-[13.5px] font-medium ${used ? "text-[#C42828]" : "text-[#5F5F5F]"}`}>
            {used}/1 questions used <span aria-hidden className="size-2 rounded-full bg-[#3CC264]" />
          </p>
        </div>
      </div>

      <div className="mt-3 flex min-h-[180px] flex-col gap-3 rounded-[20px] bg-[#E3E6E7] p-3">
        {asked === null ? (
          <>
            <p className="px-1 text-[14px] text-[#4A4A4A]">Pick a question to try Ask AI:</p>
            {ask.map((item, i) => (
              <button
                key={item.q}
                type="button"
                onClick={() => onAsk(i)}
                className="cursor-pointer self-start rounded-[16px] bg-white px-3.5 py-2.5 text-left text-[15px] font-semibold"
                style={{ color: "#2F5A47" }}
              >
                {item.q}
              </button>
            ))}
          </>
        ) : (
          <>
            <p className="ml-8 self-end rounded-[18px] bg-[#3C6E57] px-4 py-2.5 text-[15px] leading-snug text-white">{ask[asked].q}</p>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mr-8 rounded-[18px] bg-white px-4 py-3 text-[15px] leading-relaxed"
            >
              {ask[asked].a}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-1 flex items-center gap-3 rounded-[18px] border-2 border-[#E6B33D] bg-white p-3 pl-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold">Free limit reached</p>
                <p className="text-[13.5px] text-[#5F5F5F]">Upgrade to keep asking</p>
              </div>
              <button type="button" onClick={() => onPaywall("ask_ai_limit")} className="min-h-11 cursor-pointer rounded-full bg-[#E6B33D] px-4 text-[15px] font-bold text-[#2A2A2A]">
                Upgrade
              </button>
            </motion.div>
          </>
        )}
      </div>

      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          onPaywall(asked === null ? "ask_ai_custom" : "ask_ai_limit");
        }}
      >
        <label className="flex items-center gap-2 rounded-full bg-[#F1F2F3] py-1 pl-4 pr-1">
          <span className="sr-only">Ask your own question</span>
          <input
            required
            disabled={asked !== null}
            placeholder={asked === null ? "Ask your own question…" : "Question limit reached"}
            className="min-h-11 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#6B7075] disabled:cursor-not-allowed"
          />
          <button type="submit" disabled={asked !== null} aria-label="Ask" className="grid size-11 cursor-pointer place-items-center rounded-full text-white disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: "#3C6E57" }}>
            <SendHorizontal aria-hidden className="size-5" />
          </button>
        </label>
        {asked === null && <p className="mt-2 text-[12.5px] text-[#5F5F5F]">Your own questions are part of full access.</p>}
      </form>
    </SheetPanel>
  );
}

/* Explore, laid out like the BookSnap app: search, the Video Summary banner,
   categories and the book grid. Search and categories filter for real. */
function Explore({ onBook, onVideos }: { onBook: (b: Book) => void; onVideos: () => void }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const query = q.trim().toLowerCase();
  const list = SHOWCASE.filter((b) => (!cat || b.category === cat) && (!query || `${b.title} ${b.author}`.toLowerCase().includes(query)));
  return (
    <div className="h-full overflow-y-auto px-5 pb-6 pt-1">
      <label className="relative block">
        <span className="sr-only">Search books</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find your favorite book..."
          className="w-full rounded-lg bg-[#45474B] py-3 pe-12 ps-4 text-[16px] text-white placeholder-[#C4C4C4] outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        <Search aria-hidden className="absolute end-4 top-1/2 size-5 -translate-y-1/2 text-white" />
      </label>

      {!query && (
        <button type="button" onClick={onVideos} className="relative mt-4 block w-full cursor-pointer overflow-hidden rounded-2xl">
          <img src={VIDEO_BANNER} alt="" className="block h-auto w-full object-cover" />
          <span className="absolute inset-0 bg-black/25" />
          <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="mb-2 grid size-12 place-items-center rounded-full bg-[#276B54]/85">
              <Play aria-hidden className="ml-0.5 size-6 fill-current" />
            </span>
            <span className="text-[15px] font-bold">Video Summary</span>
            <span className="text-[13px] text-white/85">Watch short book summaries</span>
          </span>
        </button>
      )}

      <h3 className="mt-6 text-[18px] font-bold text-[#45474B]">Categories</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const on = cat === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              onClick={() => setCat(on ? null : c)}
              className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13.5px] font-medium transition-colors"
              style={on ? { backgroundColor: "#3C6E57", borderColor: "#3C6E57", color: "#fff" } : { borderColor: "#3C6E57", color: "#2F5A47" }}
            >
              <CatIcon c={c} />
              {c}
            </button>
          );
        })}
      </div>

      <h3 className="mt-6 text-[18px] font-bold text-[#45474B]">{query ? "Results" : cat ?? "All books"}</h3>
      {list.length ? (
        <ul className="mt-3 grid grid-cols-3 gap-4">
          {list.map((b) => (
            <li key={b.id}>
              <button type="button" onClick={() => onBook(b)} className="w-full cursor-pointer text-left">
                <BookCover book={b} className="w-full" />
                <span className="mt-1.5 block truncate text-[12.5px] font-semibold text-[#222]">{b.title}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-8 text-center">
          <p className="text-[16px] font-semibold text-[#222]">Oh no, I haven't found the book yet.</p>
          <p className="mt-1 text-[14px] text-[#5F5F5F]">Try another keyword.</p>
        </div>
      )}
    </div>
  );
}

function CatIcon({ c }: { c: string }) {
  const Icon = categoryIcon(c);
  return <Icon aria-hidden className="size-4 fill-current" strokeWidth={1.6} />;
}

function BookSheet({ book, onClose, onRead, onWatch }: { book: Book; onClose: () => void; onRead: () => void; onWatch: () => void }) {
  return (
    <SheetPanel title={book.title} onClose={onClose}>
      <div className="flex items-center gap-4">
        <BookCover book={book} className="w-16 shrink-0" />
        <div>
          <p className="text-[14px] text-[#5F5F5F]">{book.author}</p>
          <p className="mt-1 text-[13px] font-semibold" style={{ color: APP.greenDark }}>{book.category}</p>
        </div>
      </div>
      <p className="mt-4 text-[16px] leading-[1.65]">{book.excerpt[0]}</p>
      <CtaButton onClick={onRead} className="mt-5 w-full px-6 py-4 text-[16px]">Read Full Summary</CtaButton>
      <button
        type="button"
        onClick={onWatch}
        className="mt-2 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border text-[15px] font-bold"
        style={{ borderColor: APP.greenDark, color: APP.greenDark }}
      >
        <Play aria-hidden className="size-4 fill-current" /> Watch Video Summary
      </button>
    </SheetPanel>
  );
}

/* "Video summary available" card, as the app shows it under a summary. */
function VideoCard({ book, onPlay }: { book: Book; onPlay: () => void }) {
  return (
    <button type="button" onClick={onPlay} className="mt-6 flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[#1A1A1A] p-3 text-left">
      <span className="relative w-11 shrink-0 overflow-hidden rounded-md">
        <BookCover book={book} className="w-full" />
        <span className="absolute inset-0 grid place-items-center bg-black/35">
          <Play aria-hidden className="size-4 fill-white text-white" />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-bold text-white">Video summary available</span>
        <span className="mt-0.5 block truncate text-[12.5px] text-white/80">Watch visual breakdown now</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-[#1A1A1A]">
        <Play aria-hidden className="size-3.5 fill-current" /> Play
      </span>
    </button>
  );
}

/* Vertical, swipeable video feed like the app's /video screen. Videos marked
   free play in full; others play a VIDEO_TEASER_SECONDS teaser, then ask for
   full access. Items without a video URL get an animated visual breakdown. */
function VideoFeed({ start, onClose, onRead, onPlay, onPaywall }: { start: number; onClose: () => void; onRead: () => void; onPlay: (id: string) => void; onPaywall: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(start);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    (root.children[start] as HTMLElement | undefined)?.scrollIntoView({ block: "start" });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { root, threshold: 0.6 }
    );
    Array.from(root.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [start]);

  return (
    <motion.div role="dialog" aria-label="Video summaries" className="absolute inset-0 z-40 bg-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div ref={ref} className="h-full snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VIDEO_FEED.map((item, i) => (
          <VideoSlide
            key={item.id}
            index={i}
            item={item}
            active={i === active}
            near={Math.abs(i - active) <= 1}
            onPlay={() => onPlay(item.id)}
            onPaywall={() => onPaywall(item.id)}
            onRead={item.book?.id === FREE_SUMMARY.book.id ? onRead : () => onPaywall(item.id)}
          />
        ))}
      </div>
      <button type="button" onClick={onClose} aria-label="Back" className="absolute left-4 top-[max(16px,env(safe-area-inset-top))] z-20 grid size-11 cursor-pointer place-items-center rounded-full bg-[#888B8B]/80 text-white">
        <ChevronLeft aria-hidden className="size-6" />
      </button>
    </motion.div>
  );
}

const CAPTION_SECONDS = 3.5;

function VideoSlide({ index, item, active, near, onPlay, onPaywall, onRead }: { index: number; item: VideoItem; active: boolean; near: boolean; onPlay: () => void; onPaywall: () => void; onRead: () => void }) {
  const { book, free } = item;
  const captions = book ? book.excerpt.join(" ").match(/[^.!?]+[.!?]+/g)?.map((c) => c.trim()) ?? book.excerpt : [];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [t, setT] = useState(0);
  const [length, setLength] = useState(Math.max(1, captions.length) * CAPTION_SECONDS);
  const played = useRef(false);
  const limit = free ? length : Math.min(VIDEO_TEASER_SECONDS, length);
  const locked = !free && t >= limit;
  const ended = free && t >= length - 0.05;

  // Autoplay when the slide scrolls into view, pause when it leaves.
  useEffect(() => {
    if (active && !locked && !ended) setPlaying(true);
    if (!active) setPlaying(false);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (playing && !played.current) {
      played.current = true;
      onPlay();
    }
    const v = videoRef.current;
    if (v) {
      if (!playing) return void v.pause();
      v.play().catch(() => {
        // Autoplay with sound was blocked: start muted and offer "Tap for sound".
        v.muted = true;
        setMuted(true);
        v.play().catch(() => setPlaying(false));
      });
      return;
    }
    if (!playing) return;
    const id = window.setInterval(() => setT((x) => x + 0.1), 100);
    return () => window.clearInterval(id);
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (locked || ended) setPlaying(false);
  }, [locked, ended]);

  const caption = Math.min(captions.length - 1, Math.floor(t / CAPTION_SECONDS));
  const toggle = () => {
    if (locked) return;
    if (ended) {
      setT(0);
      if (videoRef.current) videoRef.current.currentTime = 0;
      return setPlaying(true);
    }
    setPlaying((p) => !p);
  };
  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  return (
    <section data-i={index} className="relative h-full snap-start overflow-hidden" aria-label={`${item.title} video summary`}>
      {item.src ? (
        <video
          ref={videoRef}
          src={near ? item.src : undefined}
          poster={item.poster}
          preload={active ? "auto" : "metadata"}
          playsInline
          onLoadedMetadata={(e) => setLength(e.currentTarget.duration || length)}
          onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onEnded={() => setT(length)}
          className="absolute inset-0 h-full w-full bg-black object-cover"
        />
      ) : book ? (
        <>
          <img src={book.cover} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-8 pb-24">
            <motion.div className="w-[42%] max-w-[190px]" animate={{ scale: playing ? 1.06 : 1, rotate: playing ? -1.5 : 0 }} transition={{ duration: 6, ease: "easeInOut" }}>
              <BookCover book={book} className="w-full shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)]" />
            </motion.div>
            <div className={`min-h-[6.5em] w-full max-w-[400px] text-center ${locked ? "invisible" : ""}`} aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.p
                  key={caption}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-[19px] font-bold leading-snug text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]"
                >
                  {captions[caption]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

      {/* Tap anywhere to play / pause */}
      <button type="button" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className="absolute inset-0 cursor-pointer">
        {!playing && !locked && !ended && (
          <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#EFB100] shadow-lg">
            <Play aria-hidden className="ml-1 size-7 fill-white text-white" />
          </span>
        )}
        {playing && buffering && (
          <span aria-label="Loading" className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        )}
      </button>

      {item.src && (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Turn sound on" : "Mute"}
          className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] z-20 flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#888B8B]/80 px-3 text-[13px] font-bold text-white"
        >
          {muted ? <VolumeX aria-hidden className="size-5" /> : <Volume2 aria-hidden className="size-5" />}
          {muted && "Tap for sound"}
        </button>
      )}

      {/* Progress */}
      <div className="pointer-events-none absolute inset-x-4 top-[max(70px,calc(env(safe-area-inset-top)+56px))] h-1 overflow-hidden rounded-full bg-white/25">
        <div className="h-full rounded-full bg-[#EFB100]" style={{ width: `${Math.min(100, (t / length) * 100)}%` }} />
      </div>

      <div className="pointer-events-none absolute bottom-8 left-0 right-0 px-5">
        <p className="text-[16px] font-bold leading-tight text-white">{item.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/75">
          {item.author} · {playing ? <Pause aria-hidden className="size-3 fill-current" /> : <Play aria-hidden className="size-3 fill-current" />} Video summary
        </p>
      </div>

      {(locked || ended) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 px-8 text-center text-white">
          {locked ? (
            <>
              <Lock aria-hidden className="size-7 text-gold" />
              <p className="mt-3 font-display text-[22px] font-extrabold leading-tight">Keep watching {item.title}</p>
              <p className="mt-2 text-[15px] text-white/80">The full video summary is part of full access.</p>
              <CtaButton tone="gold" onClick={onPaywall} className="mt-5 w-full max-w-[320px] px-6 py-4 text-[16px]">Unlock Full Video</CtaButton>
            </>
          ) : (
            <>
              <p className="font-display text-[22px] font-extrabold leading-tight">That's the video summary.</p>
              <div className="mt-5 flex w-full max-w-[320px] flex-col gap-2">
                <CtaButton tone="gold" onClick={onRead} className="w-full px-6 py-4 text-[16px]">Read the Summary</CtaButton>
                <button type="button" onClick={toggle} className="min-h-12 cursor-pointer rounded-full border border-white/50 text-[15px] font-bold">Replay</button>
              </div>
            </>
          )}
          <p className="mt-6 text-[13px] text-white/70">Swipe up for the next book</p>
        </div>
      )}
    </section>
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
    <motion.div className="absolute inset-0 z-30 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-black/40" />
      <motion.section
        role="dialog"
        aria-label={title}
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        transition={{ duration: 0.35, ease }}
        className="relative max-h-[85%] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3"
      >
        <div aria-hidden className="mx-auto mb-2 h-1 w-10 rounded-full bg-[#D6D6D6]" />
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

function NavItem({ icon: Icon, label, active, onClick }: { icon: typeof House; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className="flex min-h-12 min-w-16 cursor-pointer flex-col items-center justify-center gap-1 px-2 py-1.5 text-[12px]"
      style={{ color: active ? APP.yellow : "#D9D9D9" }}
    >
      <Icon aria-hidden className="size-6" strokeWidth={1.8} />
      <span className={active ? "font-bold" : ""}>{label}</span>
    </button>
  );
}

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Bell, Bookmark, ChevronLeft, Download, Heart, Home as HomeIcon, Lightbulb, ListFilter, Maximize2, MessageCircle, PenLine, Search, Share2, User, Volume2, type LucideIcon } from "lucide-react";
import { HOME_BOOKS, type HomeBook } from "./homeBooks";
import { APP } from "./ui";

/*
 * Where a successful payment lands: the app's home screen for a signed-in reader,
 * matched to captures of apps.booksnap.ai/en/home. There is no onboarding, tour or
 * paywall here. Swipe up or down for another book, left or right to turn its
 * pages. The round buttons, stats and tabs show the layout and do nothing yet.
 */

const SWIPE_PX = 50;
const WHEEL_DELTA = 30;
const WHEEL_COOLDOWN_MS = 700;
const SLIDE = "transition-transform duration-300 ease-out motion-reduce:transition-none";

/**
 * A book's reading pages, each a list of paragraphs. The app's chapters need a
 * sign-in, so these are its catalogue description, two sentences to a page, plus
 * any page transcribed from the app.
 */
function readingPages({ about, appPage }: HomeBook) {
  const sentences = (about.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [about]).map((s) => s.trim());
  const pages: string[][] = [];
  for (let i = 0; i < sentences.length; i += 2) pages.push(sentences.slice(i, i + 2));
  if (appPage) pages.splice(1, 0, appPage);
  return pages;
}

const BOOK_PAGES = HOME_BOOKS.map(readingPages);

function RoundButton({ label, size = 40, bg, color = APP.ink, className = "", children }: { label: string; size?: number; bg: string; color?: string; className?: string; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} className={`grid shrink-0 cursor-pointer place-items-center rounded-full ${className}`} style={{ width: size, height: size, backgroundColor: bg, color }}>
      {children}
    </button>
  );
}

function ReadingPage({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="h-full overflow-hidden bg-white px-7 pb-[92px] pt-4">
      {/* Scales with height: the feed takes every touch, so this text cannot scroll. */}
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="mb-6 text-[clamp(13px,2.1svh,17px)] leading-[1.6]" style={{ color: APP.ink }}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function StatsBar({ book }: { book: HomeBook }) {
  const stats: [string, LucideIcon, number][] = [
    ["Like", Heart, book.likes],
    ["Comment", MessageCircle, 0],
    ["Share", Share2, book.shares],
    ["Bookmark", Bookmark, 0],
  ];
  return (
    <div className="flex items-center justify-around rounded-[22px] px-3 py-2.5" style={{ backgroundColor: APP.yellow }}>
      {stats.map(([label, Icon, count]) => (
        <button key={label} type="button" aria-label={`${label}: ${count}`} className="flex min-h-[24px] cursor-pointer items-center gap-1.5 text-[14px] font-bold" style={{ color: APP.ink }}>
          <Icon aria-hidden className="size-6" style={{ color: APP.green }} fill={APP.green} />
          {count}
        </button>
      ))}
    </div>
  );
}

function BookCard({ book, pages, page, dragX, dragging, onNext }: { book: HomeBook; pages: string[][]; page: number; dragX: number; dragging: boolean; onNext: () => void }) {
  const count = pages.length + 1;
  const width = 100 / count;
  return (
    <div className="relative h-full overflow-hidden rounded-[20px]">
      <div className={`flex h-full ${dragging ? "" : SLIDE}`} style={{ width: `${count * 100}%`, transform: `translateX(calc(${-width * page}% + ${dragX}px))` }}>
        <div className="h-full" style={{ width: `${width}%` }}>
          <img src={book.cover} alt={`${book.title} by ${book.author}`} draggable={false} className="h-full w-full object-cover" />
        </div>
        {pages.map((paragraphs, i) => (
          <div key={i} className="h-full" style={{ width: `${width}%` }}>
            <ReadingPage paragraphs={paragraphs} />
          </div>
        ))}
      </div>

      {page === 0 && (
        <div className="absolute inset-x-4 top-5 flex items-start justify-between">
          <RoundButton label="Download" bg="#EFB100">
            <Download aria-hidden className="size-5" />
          </RoundButton>
          <RoundButton label="Full screen" size={36} bg="rgba(0,0,0,0.35)" color="#fff">
            <Maximize2 aria-hidden className="size-[18px]" />
          </RoundButton>
          <RoundButton label="Ask AI" bg="#EFB100">
            <Lightbulb aria-hidden className="size-5" />
          </RoundButton>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 pb-2">
        {page === 0 ? (
          <div className="relative flex items-center justify-center px-4">
            <button type="button" onClick={onNext} className="inline-flex min-h-[50px] cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-black/25 px-6 text-[16px] font-semibold text-white">
              Swipe to Read
              <span aria-hidden className="flex">
                {[0, 1, 2].map((i) => (
                  <ChevronLeft key={i} className="-mx-1 size-5" strokeWidth={2.5} />
                ))}
              </span>
            </button>
            <RoundButton label="Play audio" size={44} bg={APP.yellow} className="absolute right-4">
              <Volume2 aria-hidden className="size-5" />
            </RoundButton>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-3 pr-2">
            <RoundButton label="Add a note" size={44} bg="#fff" color={APP.greenDark} className="shadow-[0_4px_14px_rgba(0,0,0,0.14)]">
              <PenLine aria-hidden className="size-5" />
            </RoundButton>
            <RoundButton label="Play audio" size={44} bg={APP.yellow}>
              <Volume2 aria-hidden className="size-5" />
            </RoundButton>
          </div>
        )}
        <div className="mt-[52px] flex items-center justify-center gap-2" aria-hidden>
          {Array.from({ length: count }, (_, dot) => (
            <span key={dot} className="h-2 rounded-full transition-all duration-200" style={{ width: dot === page ? 16 : 8, backgroundColor: dot === page ? APP.yellow : APP.chrome }} />
          ))}
        </div>
        <div className="mx-5 mt-3">
          <StatsBar book={book} />
        </div>
      </div>
    </div>
  );
}

const TABS: [string, LucideIcon][] = [
  ["Home", HomeIcon],
  ["Explore", Search],
  ["ASK.AI", Lightbulb],
  ["Profile", User],
];

export function Home() {
  const [position, setPosition] = useState({ book: 0, page: 0 });
  const [drag, setDrag] = useState<{ axis: "x" | "y" | null; px: number }>({ axis: null, px: 0 });
  const gesture = useRef<{ id: number; x: number; y: number; axis: "x" | "y" | null } | null>(null);
  const feed = useRef<HTMLDivElement>(null);

  const turnPage = (by: number) => setPosition((p) => ({ ...p, page: Math.max(0, Math.min(p.page + by, BOOK_PAGES[p.book].length)) }));
  const moveBook = (by: number) => setPosition((p) => ({ book: Math.max(0, Math.min(p.book + by, HOME_BOOKS.length - 1)), page: 0 }));

  // Non-passive, so a trackpad scroll moves the feed rather than the page.
  useEffect(() => {
    const el = feed.current;
    if (!el) return undefined;
    let quietUntil = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now < quietUntil) return;
      if (Math.abs(e.deltaY) >= WHEEL_DELTA && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        quietUntil = now + WHEEL_COOLDOWN_MS;
        moveBook(Math.sign(e.deltaY));
      } else if (Math.abs(e.deltaX) >= WHEEL_DELTA) {
        quietUntil = now + WHEEL_COOLDOWN_MS;
        turnPage(Math.sign(e.deltaX));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") moveBook(1);
      if (e.key === "ArrowUp") moveBook(-1);
      if (e.key === "ArrowRight") turnPage(1);
      if (e.key === "ArrowLeft") turnPage(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, axis: null };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      // Captured only now, so a plain tap still reaches the button under it.
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setDrag({ axis: g.axis, px: g.axis === "x" ? dx : dy });
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    setDrag({ axis: null, px: 0 });
    if (!g.axis) return;
    const d = g.axis === "x" ? e.clientX - g.x : e.clientY - g.y;
    if (Math.abs(d) < SWIPE_PX) return;
    if (g.axis === "x") turnPage(d < 0 ? 1 : -1);
    else moveBook(d < 0 ? 1 : -1);
  };

  return (
    <div className="fixed inset-0 flex justify-center overflow-hidden bg-[#e7ecea]">
      <div className="flex h-full w-full max-w-[430px] flex-col bg-white">
        <header className="flex items-center justify-between gap-3 px-3 pb-2 pt-2">
          <RoundButton label="Filter" bg="#d5e3de" color={APP.greenDark}>
            <ListFilter aria-hidden className="size-5" />
          </RoundButton>
          <div className="flex w-[224px] rounded-[10px] p-1" style={{ backgroundColor: APP.chrome }}>
            <button type="button" aria-current="page" className="min-h-[32px] flex-1 cursor-pointer rounded-lg text-[12px] font-semibold text-white" style={{ backgroundColor: APP.green }}>
              For You
            </button>
            <button type="button" className="min-h-[32px] flex-1 cursor-pointer text-[12px] font-semibold text-white">
              My Library
            </button>
          </div>
          <RoundButton label="Notifications" bg="#edf4f1" color={APP.greenDark}>
            <Bell aria-hidden className="size-5" />
          </RoundButton>
        </header>

        <div
          ref={feed}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          className="relative mx-3 mb-3 min-h-0 flex-1 touch-none select-none overflow-hidden rounded-[20px]"
        >
          <div className={`h-full ${drag.axis ? "" : SLIDE}`} style={{ transform: `translateY(calc(${-100 * position.book}% + ${drag.axis === "y" ? drag.px : 0}px))` }}>
            {HOME_BOOKS.map((book, i) => (
              // `inert`, so Tab and screen readers skip the books out of view.
              <div key={book.slug} className="h-full" {...(i === position.book ? {} : ({ inert: "" } as object))}>
                <BookCard
                  book={book}
                  pages={BOOK_PAGES[i]}
                  page={i === position.book ? position.page : 0}
                  dragX={i === position.book && drag.axis === "x" ? drag.px : 0}
                  dragging={drag.axis !== null}
                  onNext={() => turnPage(1)}
                />
              </div>
            ))}
          </div>
        </div>

        <nav className="grid grid-cols-4 px-2 pb-[max(6px,env(safe-area-inset-bottom))] pt-2" style={{ backgroundColor: APP.chrome }}>
          {TABS.map(([label, Icon], i) => (
            <button key={label} type="button" aria-current={i === 0 ? "page" : undefined} className="flex min-h-[44px] cursor-pointer flex-col items-center justify-center text-[12px] font-medium" style={{ color: i === 0 ? APP.yellow : "#d8dadc" }}>
              <Icon aria-hidden className="size-6" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

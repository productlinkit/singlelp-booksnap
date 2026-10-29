import atomicHabits from "../imports/covers/atomic-habits.jpg";
import zeroToOne from "../imports/covers/zero-to-one.jpg";
import networkEffects from "../imports/covers/network-effects.jpg";
import callMeByYourName from "../imports/covers/call-me-by-your-name.jpg";
import timeTravelersWife from "../imports/covers/time-travelers-wife.jpg";
export { default as VIDEO_BANNER } from "../imports/video-summary.jpg";
import meBeforeYouPoster from "../imports/videos/me-before-you.jpg";

// ── Go-live switches ─────────────────────────────────────────────
// Real checkout (Stripe Checkout, Xendit, app store…). It should redirect back to
// `/?checkout=success&plan=<id>` so the success event fires. While empty, the
// paywall opens a clearly labelled demo checkout instead — nothing is charged.
export const CHECKOUT_URL = "";
// Where "Start reading" sends subscribers after payment (web app or app store link).
export const APP_URL = "";

// Taken from the existing BookSnap pricing design and FAQ. Confirm before launch.
export const TRIAL_DAYS = 3;

export type Plan = {
  id: "premium" | "pro";
  name: string;
  monthly: string;
  yearlyPerMonth: string;
  yearlyTotal: string;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "premium",
    name: "Premium",
    monthly: "$2.99",
    yearlyPerMonth: "$1.99",
    yearlyTotal: "$23.88",
    features: ["50+ book summaries", "Text + audio recaps", "Ask AI (10 chats)"],
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    monthly: "$5.99",
    yearlyPerMonth: "$3.99",
    yearlyTotal: "$47.88",
    features: ["Everything in Premium", "Full Ask AI experience", "Early access to new summaries"],
  },
];

// ── Sample content ───────────────────────────────────────────────
// Covers are BookSnap's own cover assets. The Zero to One excerpt is real BookSnap
// app copy. Other excerpts, Ask AI answers and the free
// summary below are PLACEHOLDER copy written for this prototype; replace them
// with BookSnap's StoryFlow content before launch.

export type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  // BookSnap video summary (mp4 URL). While empty, the player shows an animated
  // visual breakdown built from the excerpt instead.
  video?: string;
  // Opening of the StoryFlow summary shown in the phone mockup.
  excerpt: string[];
  ask: { q: string; a: string };
};

// Business and self-improvement first: that's who the ads target.
export const SHOWCASE: Book[] = [
  {
    id: "zero-to-one",
    title: "Zero to One",
    author: "Peter Thiel",
    cover: zeroToOne,
    category: "Business",
    video: "",
    excerpt: [
      "Zero to One by Peter Thiel is not a guide to following trends or improving what already exists; it is a manifesto about creating the future from scratch. The book begins with a powerful question: What important truth do very few people agree with you on? Thiel believes that answering this question is the first step toward discovering unique opportunities and building something truly valuable.",
      "The central idea of the book is the difference between horizontal progress and vertical progress. Horizontal progress means going from 1 to N, taking something that already works and expanding or copying it on a larger scale. This is the type of progress driven by globalization and replication. In contrast, vertical progress means going from 0 to 1, creating something completely new that has never existed before.",
    ],
    ask: { q: "What makes a startup worth building?", a: "A secret: an important truth few people agree with, turned into something no one else can copy." },
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    cover: atomicHabits,
    category: "Self-Improvement",
    video: "",
    excerpt: [
      "Atomic Habits by James Clear argues that real change does not come from one big decision, but from hundreds of tiny ones. Getting just 1% better every day compounds into results that look like overnight success.",
      "Clear's central idea is that you should focus on systems, not goals. Winners and losers often share the same goals; what separates them is the daily process they follow.",
    ],
    ask: { q: "How do I make a habit stick?", a: "Make it obvious, attractive, easy and satisfying. Start with a two-minute version." },
  },
  {
    id: "network-effects",
    title: "The Network Effects",
    author: "Meir Valman",
    cover: networkEffects,
    category: "Business",
    video: "",
    excerpt: [
      "Some products get more valuable with every new person who uses them. A phone network, a marketplace or a social app is only as useful as the people already on it.",
      "That loop, where each new user adds value for everyone else, is one of the strongest advantages a business can build, and one of the hardest for competitors to copy.",
    ],
    ask: { q: "Why do network effects matter?", a: "Each new user adds value for everyone else, so growth starts to reinforce itself." },
  },
  {
    id: "call-me-by-your-name",
    title: "Call Me by Your Name",
    author: "André Aciman",
    cover: callMeByYourName,
    category: "Fiction",
    video: "",
    excerpt: [
      "One summer on the Italian Riviera, seventeen-year-old Elio meets Oliver, the charming scholar staying with his family. What begins as rivalry slowly turns into an intense first love.",
      "Told as Elio looks back years later, the novel is less about what happened than about how memory keeps a single summer alive for a lifetime.",
    ],
    ask: { q: "What is the book really about?", a: "How a single summer can shape a life, and how we remember the people who changed us." },
  },
  {
    id: "time-travelers-wife",
    title: "The Time Traveler's Wife",
    author: "Audrey Niffenegger",
    cover: timeTravelersWife,
    category: "Fiction",
    video: "",
    excerpt: [
      "Henry has a rare condition: without warning, he slips through time. Clare meets him for the first time when she is six and he is in his thirties; he meets her for the first time years later.",
      "Told in turns by both of them and out of chronological order, the novel asks what it means to love someone you can never be sure will stay.",
    ],
    ask: { q: "How does the story work?", a: "It alternates between Henry and Clare, jumping between dates so their love unfolds out of sequence." },
  },
];

// The free summary, shown page by page in the app-style reader. Like Deepstash, every
// feature can be tried, but only the first FREE_PAGES pages can be read; the rest of
// the summary sits behind the paywall.
// Pages 1–2 are real BookSnap app copy; pages 3–5 are PLACEHOLDER copy written for
// this prototype in the same voice. Replace with the full StoryFlow text before launch.
const freeBook = SHOWCASE.find((b) => b.id === "zero-to-one")!;

export const CATEGORIES = [...new Set(SHOWCASE.map((b) => b.category))];
// Videos marked `free` play in full; the rest play a short teaser, then ask for full access.
export const VIDEO_TEASER_SECONDS = 8;

export const FREE_SUMMARY = {
  book: freeBook,
  freePages: 3,
  pages: [
    [freeBook.excerpt[0]],
    [
      freeBook.excerpt[1],
      "Thiel calls this vertical progress technology, in the broadest sense: any new and better way of doing things. Globalization can spread what already works, but only technology can make the future genuinely better.",
    ],
    [
      "One of Thiel's most provocative claims is that competition is for losers. Economists praise perfect competition, but in a perfectly competitive market no company keeps a lasting profit; every gain is competed away.",
      "The businesses that create the most value are monopolies in the good sense: companies so much better at what they do that nobody offers a close substitute. Because they don't have to fight for survival every day, they can afford to plan, invest and take care of their people.",
    ],
    [
      "How do you build one? Start small and dominate a niche. PayPal began with a few thousand power sellers on eBay; Facebook started at a single university. It is far easier to own a small market completely and then expand than to grab a sliver of a huge one.",
      "Thiel names four traits of a durable business: proprietary technology that is at least ten times better than the alternative, network effects, economies of scale, and a strong brand.",
    ],
    [
      "Great companies are built on secrets: important truths hidden in plain sight that most people have stopped looking for. The best place to start is the question that opens the book: what valuable company is nobody building?",
      "Then commit to a definite plan. Startup outcomes follow a power law, where one great bet outweighs many mediocre ones. You are not a lottery ticket: build something new, own your niche and plan for the long term. That is how you go from zero to one.",
    ],
  ] as string[][],
  // Suggested Ask AI questions with prepared answers, so visitors can try the feature.
  // Free-form questions are part of full access.
  ask: [
    {
      q: "What does \"zero to one\" mean?",
      a: "Going from 0 to 1 means creating something genuinely new: vertical progress. Going from 1 to n means copying what already works: horizontal progress. Thiel argues the future depends on the first kind.",
    },
    {
      q: "Why is competition for losers?",
      a: "In a perfectly competitive market, profits get competed away, so no one can plan or invest for the long term. The most valuable companies escape competition by being so much better that they own their market.",
    },
    {
      q: "How can I use this in my career?",
      a: "Look for a niche where you can be the best instead of one of many, and commit to a definite long-term plan rather than keeping every option open.",
    },
  ],
};

// ── Video summaries ──────────────────────────────────────────────
// The feed behind Explore → Video Summary. Real BookSnap videos come first; books
// without a video URL fall back to an animated visual breakdown of the excerpt.
export type VideoItem = {
  id: string;
  title: string;
  author: string;
  src?: string;
  poster?: string;
  book?: Book;
  free: boolean;
};

export const VIDEO_FEED: VideoItem[] = [
  {
    id: "me-before-you",
    title: "Me Before You",
    author: "Jojo Moyes",
    // ~204 MB, 2.5 min, 1440x2550. Ask for a compressed, "faststart" MP4 before running ads.
    src: "https://be.booksnap.ai/uploads/videos/files/3798e820-c7b5-40d7-af0a-ac494e1ef583_1776411337.mp4",
    poster: meBeforeYouPoster,
    free: true,
  },
  ...SHOWCASE.map((b) => ({ id: b.id, title: b.title, author: b.author, src: b.video || undefined, book: b, free: b.id === freeBook.id })),
];

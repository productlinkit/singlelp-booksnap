import atomicHabits from "../imports/covers/atomic-habits.jpg";
import zeroToOne from "../imports/covers/zero-to-one.jpg";
import networkEffects from "../imports/covers/network-effects.jpg";
import callMeByYourName from "../imports/covers/call-me-by-your-name.jpg";
import timeTravelersWife from "../imports/covers/time-travelers-wife.jpg";

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
  // Opening of the StoryFlow summary shown in the phone mockup.
  excerpt: string[];
  ask: { q: string; a: string };
};

// Business and self-improvement first: that's who the ads target.
export const SHOWCASE: Book[] = [
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    cover: atomicHabits,
    excerpt: [
      "Atomic Habits by James Clear argues that real change does not come from one big decision, but from hundreds of tiny ones. Getting just 1% better every day compounds into results that look like overnight success.",
      "Clear's central idea is that you should focus on systems, not goals. Winners and losers often share the same goals; what separates them is the daily process they follow.",
    ],
    ask: { q: "How do I make a habit stick?", a: "Make it obvious, attractive, easy and satisfying. Start with a two-minute version." },
  },
  {
    id: "zero-to-one",
    title: "Zero to One",
    author: "Peter Thiel",
    cover: zeroToOne,
    excerpt: [
      "Zero to One by Peter Thiel is not a guide to following trends or improving what already exists; it is a manifesto about creating the future from scratch. The book begins with a powerful question: What important truth do very few people agree with you on? Thiel believes that answering this question is the first step toward discovering unique opportunities and building something truly valuable.",
      "The central idea of the book is the difference between horizontal progress and vertical progress. Horizontal progress means going from 1 to N, taking something that already works and expanding or copying it on a larger scale. In contrast, vertical progress means going from 0 to 1, creating something completely new that has never existed before.",
    ],
    ask: { q: "What makes a startup worth building?", a: "A secret: an important truth few people agree with, turned into something no one else can copy." },
  },
  {
    id: "network-effects",
    title: "The Network Effects",
    author: "Meir Valman",
    cover: networkEffects,
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
    excerpt: [
      "Henry has a rare condition: without warning, he slips through time. Clare meets him for the first time when she is six and he is in his thirties; he meets her for the first time years later.",
      "Told in turns by both of them and out of chronological order, the novel asks what it means to love someone you can never be sure will stay.",
    ],
    ask: { q: "How does the story work?", a: "It alternates between Henry and Clare, jumping between dates so their love unfolds out of sequence." },
  },
];

export type Idea = { title: string; body: string };

export const FREE_SUMMARY = {
  book: SHOWCASE[0],
  ideas: [
    {
      title: "Small gains compound",
      body: "Getting 1% better each day doesn't feel like much, but it compounds. Over a year, tiny improvements add up to results that look like overnight success, years in the making.",
    },
    {
      title: "Systems beat goals",
      body: "Winners and losers often share the same goals. What separates them is the system: the daily process. Fall in love with the process and the results follow.",
    },
    {
      title: "Become the person first",
      body: "Lasting change starts with identity. Don't aim to read a book; aim to become a reader. Every small action is a vote for the person you want to be.",
    },
    {
      title: "The four laws of habit",
      body: "To build a habit, make it obvious, attractive, easy and satisfying. To break one, flip each law: make it invisible, unattractive, difficult and unsatisfying.",
    },
    {
      title: "Start with two minutes",
      body: "Scale any new habit down to two minutes. \"Read before bed\" becomes \"read one page.\" Master showing up first; improvement comes after.",
    },
  ] as Idea[],
  // Shown locked at the end of the preview to make the rest of the book tangible.
  lockedChapters: ["Habit stacking", "Designing your environment", "Never miss twice", "Why motivation is overrated"],
  ask: {
    q: "How can I apply this to reading more?",
    a: "Stack it on an existing habit: after you pour your morning coffee, read one page. Keep the book where you'll see it, and track a streak so missing a day feels unsatisfying.",
  },
};

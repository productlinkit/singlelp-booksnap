import zeroToOne from "../../imports/feed/zero-to-one.jpg";
import theNetworkEffects from "../../imports/feed/the-network-effects.jpg";
import brokeMillennial from "../../imports/feed/broke-millennial.jpg";
import theAutomaticMillionaire from "../../imports/feed/the-automatic-millionaire.jpg";
import oneUpOnWallStreet from "../../imports/feed/one-up-on-wall-street.jpg";
import secretsOfTheMillionaireMind from "../../imports/feed/secrets-of-the-millionaire-mind.jpg";

// The first six English books the app's home screen loads, as served by
// https://be.booksnap.ai/api/v1/books?language=en. Covers are local copies.
// `appPage` is a page transcribed from the signed-in app, as it appears on its reading screen.
export type HomeBook = { slug: string; title: string; author: string; cover: string; likes: number; shares: number; about: string; appPage?: string[] };

export const HOME_BOOKS: HomeBook[] = [
  {
    slug: 'zero-to-one',
    title: 'Zero to One',
    author: 'Peter Thiel',
    cover: zeroToOne,
    likes: 2,
    shares: 6,
    appPage: [
      'Thiel argues that the next generation of successful entrepreneurs will not succeed by simply recreating what previous innovators have done. The next Bill Gates will not build another operating system, and the next Mark Zuckerberg will not create another social network. If you are only copying successful companies, you are not truly learning from them.',
      'Instead, entrepreneurs should focus on discovering new possibilities and building solutions that are fundamentally different. The greatest companies are not created by following existing markets but by creating new ones.',
    ],
    about:
      'Zero to One by Peter Thiel is a powerful exploration of innovation, entrepreneurship, and the process of creating the future rather than simply copying the past. Thiel argues that true progress comes from moving from 0 to 1 — creating something entirely new — instead of following existing trends or improving what already exists. Through concepts such as creative monopolies, proprietary technology, network effects, power laws, and hidden secrets, the book explains why the most successful companies are built by those who discover unique opportunities and solve problems others overlook. Thiel challenges the traditional belief that competition drives success, suggesting that the greatest companies achieve dominance by creating something so valuable and differentiated that they operate in their own market. Ultimately, Zero to One is a manifesto for entrepreneurs who want to build groundbreaking companies and shape a future that does not yet exist.',
  },
  {
    slug: 'the-network-effects',
    title: 'The Network Effects',
    author: 'Meir Valman',
    cover: theNetworkEffects,
    likes: 3,
    shares: 4,
    about:
      'platforms, explaining why some apps, companies, and ideas grow exponentially while others fail. Through examples from the telephone, fax machine, social media, and marketplaces like Uber and Airbnb, Valman reveals how networks become more valuable as more people join, creating powerful cycles of growth and influence. The book explores concepts such as Metcalfe’s Law, lock-in effects, tipping points, and two-sided marketplaces to explain how connections shape modern business and society. It also examines the risks of powerful networks, including monopolies and the difficulty of leaving established platforms. Ultimately, The Network Effects shows that in the modern world, the greatest source of value is not just the product itself, but the connections created between people.',
  },
  {
    slug: 'broke-millennial',
    title: 'Broke Millennial',
    author: 'Erin Lowry',
    cover: brokeMillennial,
    likes: 0,
    shares: 0,
    about:
      'Stop scrolling and start stacking because the secret to financial freedom isn\'t about skipping your morning coffee, it\'s about mastering the game of money before it masters you. This narrative guide is the ultimate blueprint for turning a hollow bank account into a powerhouse of wealth while navigating the chaotic reality of modern life.',
  },
  {
    slug: 'the-automatic-millionaire',
    title: 'The Automatic Millionaire',
    author: 'David Bach',
    cover: theAutomaticMillionaire,
    likes: 0,
    shares: 0,
    about:
      'Wealth is not built through sheer willpower or complex budgeting, but through a silent, automated system that works while you sleep. This narrative reveals how ordinary people achieve extraordinary riches by removing the human element from the equation entirely.',
  },
  {
    slug: 'one-up-on-wall-street',
    title: 'One Up On Wall Street',
    author: 'Peter Lynch',
    cover: oneUpOnWallStreet,
    likes: 0,
    shares: 0,
    about:
      'You don\'t need a PhD in finance to beat the world\'s most sophisticated investors; you just need to keep your eyes open at the grocery store. Success in the stock market comes from spotting great companies in your daily life before the experts even know they exist.',
  },
  {
    slug: 'secrets-of-the-millionaire-mind',
    title: 'Secrets of the Millionaire Mind',
    author: 'T. Harv Eker',
    cover: secretsOfTheMillionaireMind,
    likes: 0,
    shares: 0,
    about:
      'Your internal thermostat for wealth is set at birth, and unless you reprogram it, you will stay at that exact financial temperature forever regardless of how much you earn. This is the hidden psychological blueprint that dictates your bank account\'s fate before you even make your first dollar.',
  },
]

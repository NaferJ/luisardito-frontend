export type ChannelPlatform = {
  label: string
  href: string
}

export type SocialLink = {
  label: string
  href: string
}

export type Channel = {
  id: string
  name: string
  handle: string
  description: string
  platforms: ChannelPlatform[]
  socials: SocialLink[]
  behind?: boolean
}

export const channels: Channel[] = [
  {
    id: "luisardito",
    name: "Luisardito",
    handle: "@luisarditoprime",
    description: "The flagship channel. The origin of the universe.",
    platforms: [
      { label: "YouTube", href: "https://www.youtube.com/@luisarditoprime" },
    ],
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@luisarditoprime" },
      { label: "TikTok", href: "https://www.tiktok.com/@luisarditoprime" },
      { label: "Instagram", href: "https://www.instagram.com/@luisarditoprime" },
    ],
  },
  {
    id: "luisardium",
    name: "Luisardium",
    handle: "@Luisardium",
    description: "A parallel element of the universe.",
    platforms: [
      { label: "YouTube", href: "https://www.youtube.com/@Luisardium" },
    ],
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@Luisardium" },
      { label: "TikTok", href: "https://www.tiktok.com/@Luisardium" },
      { label: "Instagram", href: "https://www.instagram.com/@Luisardium" },
    ],
  },
  {
    id: "luisarvoid",
    name: "Luisarvoid",
    handle: "@Luisarvoid",
    description: "The void. Also on TikTok, Instagram and Facebook.",
    platforms: [
      { label: "YouTube", href: "https://www.youtube.com/@Luisarvoid" },
      { label: "TikTok", href: "https://www.tiktok.com/@Luisarvoid" },
      { label: "Instagram", href: "https://www.instagram.com/@Luisarvoid" },
      { label: "Facebook", href: "https://www.facebook.com/@Luisarvoid" },
    ],
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@Luisarvoid" },
      { label: "TikTok", href: "https://www.tiktok.com/@Luisarvoid" },
      { label: "Instagram", href: "https://www.instagram.com/@Luisarvoid" },
    ],
  },
  {
    id: "naferj",
    name: "NaferJ",
    handle: "@NaferJ",
    description: "The developer. Owner of Luisarvoid.",
    platforms: [
      { label: "GitHub", href: "https://github.com/NaferJ" },
    ],
    socials: [
      { label: "GitHub", href: "https://github.com/NaferJ" },
    ],
    behind: true,
  },
]

export type ShowcaseSlide = {
  channelId: string
  name: string
  description: string
  socials: SocialLink[]
  video?: string
  verticalVideos?: string[]
}

export const showcaseSlides: ShowcaseSlide[] = [
  {
    channelId: "luisardito",
    name: "Luisardito",
    description: "The flagship channel. Streams, content and the origin of the universe. Join the community and be part of it.",
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@luisarditoprime" },
      { label: "TikTok", href: "https://www.tiktok.com/@luisarditoprime" },
      { label: "Instagram", href: "https://www.instagram.com/@luisarditoprime" },
    ],
    video: "/landing/videos/luisardito-1.mp4",
  },
  {
    channelId: "luisardium",
    name: "Luisardium",
    description: "A parallel element of the universe. Different content, same energy. Explore another side of the community.",
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@Luisardium" },
      { label: "TikTok", href: "https://www.tiktok.com/@Luisardium" },
      { label: "Instagram", href: "https://www.instagram.com/@Luisardium" },
    ],
    video: "/landing/videos/luisardium-1.mp4",
  },
  {
    channelId: "luisarvoid",
    name: "Luisarvoid",
    description: "The void. Short-form content across YouTube, TikTok and Instagram. Bite-sized pieces of the universe.",
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@Luisarvoid" },
      { label: "TikTok", href: "https://www.tiktok.com/@Luisarvoid" },
      { label: "Instagram", href: "https://www.instagram.com/@Luisarvoid" },
    ],
    verticalVideos: [
      "/landing/videos/luisarvoid-1.mp4",
      "/landing/videos/luisarvoid-2.mp4",
      "/landing/videos/luisarvoid-3.mp4",
    ],
  },
]

export type ShopFeature = {
  title: string
  description: string
}

export const shopFeatures: ShopFeature[] = [
  {
    title: "Earn by being active",
    description:
      "Gain loyalty points by chatting in streams, gifting subscriptions and gifting KICKS. Every action counts.",
  },
  {
    title: "Redeem exclusive rewards",
    description:
      "Spend points on official merch, VIP access, exclusive emojis and special community rewards.",
  },
  {
    title: "Transparent and verified",
    description:
      "Every point is accounted for. Track your full history of points earned and redemptions in your profile.",
  },
  {
    title: "Climb the leaderboard",
    description:
      "See where you stand among the community and work your way up the rankings.",
  },
]

export type FaqItem = {
  question: string
  answer: string
}

export const faqItems: FaqItem[] = [
  {
    question: "Who is Luisardito?",
    answer:
      "Luisardito is a content creator with an active universe of channels: Luisardito, Luisardium and Luisarvoid. This is the home of the whole universe.",
  },
  {
    question: "What is the shop?",
    answer:
      "The shop is the official rewards platform for the community. You earn loyalty points by participating in streams and redeem them for exclusive rewards.",
  },
  {
    question: "How do I earn points?",
    answer:
      "You earn points by chatting during streams, gifting subscriptions, gifting KICKS and being an active part of the community. Each action has a defined point value.",
  },
  {
    question: "What can I redeem?",
    answer:
      "Official merch, VIP access, exclusive emojis and other special rewards. The catalog is updated regularly with new items.",
  },
  {
    question: "Who runs Luisarvoid?",
    answer:
      "Luisarvoid is owned and developed by NaferJ, who also builds and maintains the shop and this site.",
  },
  {
    question: "Where can I follow along?",
    answer:
      "Luisardito and Luisardium are on YouTube. Luisarvoid is on YouTube, TikTok, Instagram and Facebook. Links are in the channels section above.",
  },
]

export const shopUrl = "https://shop.luisardito.com"
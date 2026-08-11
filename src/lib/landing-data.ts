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
      { label: "TikTok", href: "https://www.tiktok.com/@luisardox" },
      { label: "Instagram", href: "https://www.instagram.com/luisarditooo/" },
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
      { label: "Instagram", href: "https://www.instagram.com/luisarvoid/" },
      { label: "Facebook", href: "https://www.facebook.com/@Luisarvoid" },
    ],
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@Luisarvoid" },
      { label: "TikTok", href: "https://www.tiktok.com/@Luisarvoid" },
      { label: "Instagram", href: "https://www.instagram.com/luisarvoid/" },
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
    description: "The main channel. Planned videos, big productions, events and series.",
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@luisarditoprime" },
      { label: "TikTok", href: "https://www.tiktok.com/@luisardox" },
      { label: "Instagram", href: "https://www.instagram.com/luisarditooo/" },
    ],
    video: "/landing/videos/luisardito-1.mp4",
  },
  {
    channelId: "luisardium",
    name: "Luisardium",
    description: "The gameplay channel. A lot of variety, a lot of games. Another side of the community.",
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@Luisardium" },
    ],
    video: "/landing/videos/luisardium-1.mp4",
  },
  {
    channelId: "luisarvoid",
    name: "Luisarvoid",
    description: "The short-form channel. Clips, shorts and bite-sized content across every platform.",
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@Luisarvoid" },
      { label: "TikTok", href: "https://www.tiktok.com/@Luisarvoid" },
      { label: "Instagram", href: "https://www.instagram.com/luisarvoid/" },
    ],
    verticalVideos: [
      "/landing/videos/luisarvoid-1.mp4",
      "/landing/videos/luisarvoid-2.mp4",
      "/landing/videos/luisarvoid-3.mp4",
    ],
  },
]

export type CommunityFeature = {
  title: string
  description: string
}

export const communityFeatures: CommunityFeature[] = [
  {
    title: "Content for every format",
    description:
      "Long-form videos, gameplays and short-form clips. Three channels, each built for a different way to watch.",
  },
  {
    title: "Active across every platform",
    description:
      "Streams, videos, clips and posts. The community shows up everywhere Luisardito does.",
  },
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
    question: "How long do I wait for my rewards?",
    answer:
      "Reward fulfillment is announced by Luisardito. Wait for an official announcement with details on delivery and timing for each reward.",
  },
  {
    question: "Where can I follow along?",
    answer:
      "Luisardito is on YouTube, TikTok and Instagram. Luisardium is on YouTube. Luisarvoid is on YouTube, TikTok, Instagram and Facebook. Links are in the channels section above.",
  },
]

export const shopUrl = "https://shop.luisardito.com"
export const discordUrl = "https://discord.gg/z3Q24jennz"
export const redditUrl = "https://www.reddit.com/r/OSITOGANG/"

export type MakerSocial = {
  label: string
  href: string
}

export const makerSocials: MakerSocial[] = [
  { label: "GitHub", href: "https://github.com/NaferJ" },
  { label: "Instagram", href: "https://www.instagram.com/naferjml/" },
  { label: "X", href: "https://x.com/NaferJ1" },
]

// Placeholder — create the account at ko-fi.com and update this URL.
export const kofiUrl = "https://ko-fi.com/naferj"
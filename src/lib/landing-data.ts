import type { LocalizedText } from "@/content/changelog/types"

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
  description: LocalizedText
  socials: SocialLink[]
  video?: string
  verticalVideos?: string[]
}

export const showcaseSlides: ShowcaseSlide[] = [
  {
    channelId: "luisardito",
    name: "Luisardito",
    description: {
      en: "The main channel. Planned videos, big productions, events and series.",
      es: "El canal principal. Videos planeados, grandes producciones, eventos y series.",
    },
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
    description: {
      en: "The gameplay channel. A lot of variety, a lot of games. Another side of the community.",
      es: "El canal de gameplays. Mucha variedad, muchos juegos. Otra cara de la comunidad.",
    },
    socials: [
      { label: "YouTube", href: "https://www.youtube.com/@Luisardium" },
    ],
    video: "/landing/videos/luisardium-1.mp4",
  },
  {
    channelId: "luisarvoid",
    name: "Luisarvoid",
    description: {
      en: "The short-form channel. Clips, shorts and bite-sized content across every platform.",
      es: "El canal de formato corto. Clips, shorts y contenido breve en todas las plataformas.",
    },
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
  title: LocalizedText
  description: LocalizedText
}

export const communityFeatures: CommunityFeature[] = [
  {
    title: {
      en: "Content for every format",
      es: "Contenido para cada formato",
    },
    description: {
      en: "Long-form videos, gameplays and short-form clips. Three channels, each built for a different way to watch.",
      es: "Videos largos, gameplays y clips cortos. Tres canales, cada uno pensado para una forma distinta de ver.",
    },
  },
  {
    title: {
      en: "Active across every platform",
      es: "Activo en todas las plataformas",
    },
    description: {
      en: "Streams, videos, clips and posts. The community shows up everywhere Luisardito does.",
      es: "Streams, videos, clips y publicaciones. La comunidad aparece en todas partes donde está Luisardito.",
    },
  },
  {
    title: {
      en: "Earn by being active",
      es: "Gana por ser activo",
    },
    description: {
      en: "Gain loyalty points by chatting in streams, gifting subscriptions and gifting KICKS. Every action counts.",
      es: "Gana puntos de lealtad chateando en streams, regalando suscripciones y regalando KICKS. Cada acción cuenta.",
    },
  },
  {
    title: {
      en: "Redeem exclusive rewards",
      es: "Canjea recompensas exclusivas",
    },
    description: {
      en: "Spend points on official merch, VIP access, exclusive emojis and special community rewards.",
      es: "Gasta puntos en merch oficial, acceso VIP, emojis exclusivos y recompensas especiales de la comunidad.",
    },
  },
]

export type FaqItem = {
  question: LocalizedText
  answer: LocalizedText
}

export const faqItems: FaqItem[] = [
  {
    question: {
      en: "Who is Luisardito?",
      es: "¿Quién es Luisardito?",
    },
    answer: {
      en: "Luisardito is a content creator with an active universe of channels: Luisardito, Luisardium and Luisarvoid. This is the home of the whole universe.",
      es: "Luisardito es un creador de contenido con un universo activo de canales: Luisardito, Luisardium y Luisarvoid. Este es el hogar de todo el universo.",
    },
  },
  {
    question: {
      en: "What is the shop?",
      es: "¿Qué es la tienda?",
    },
    answer: {
      en: "The shop is the official rewards platform for the community. You earn loyalty points by participating in streams and redeem them for exclusive rewards.",
      es: "La tienda es la plataforma oficial de recompensas de la comunidad. Ganas puntos de lealtad participando en streams y los canjeas por recompensas exclusivas.",
    },
  },
  {
    question: {
      en: "How do I earn points?",
      es: "¿Cómo gano puntos?",
    },
    answer: {
      en: "You earn points by chatting during streams, gifting subscriptions, gifting KICKS and being an active part of the community. Each action has a defined point value.",
      es: "Ganas puntos chateando durante los streams, regalando suscripciones, regalando KICKS y siendo parte activa de la comunidad. Cada acción tiene un valor en puntos definido.",
    },
  },
  {
    question: {
      en: "What can I redeem?",
      es: "¿Qué puedo canjear?",
    },
    answer: {
      en: "Official merch, VIP access, exclusive emojis and other special rewards. The catalog is updated regularly with new items.",
      es: "Merch oficial, acceso VIP, emojis exclusivos y otras recompensas especiales. El catálogo se actualiza regularmente con nuevos artículos.",
    },
  },
  {
    question: {
      en: "How long do I wait for my rewards?",
      es: "¿Cuánto tengo que esperar por mis recompensas?",
    },
    answer: {
      en: "Reward fulfillment is announced by Luisardito. Wait for an official announcement with details on delivery and timing for each reward.",
      es: "La entrega de recompensas es anunciada por Luisardito. Espera un anuncio oficial con los detalles de entrega y plazos de cada recompensa.",
    },
  },
  {
    question: {
      en: "Where can I follow along?",
      es: "¿Dónde puedo seguirlo?",
    },
    answer: {
      en: "Luisardito is on YouTube, TikTok and Instagram. Luisardium is on YouTube. Luisarvoid is on YouTube, TikTok, Instagram and Facebook. Links are in the channels section above.",
      es: "Luisardito está en YouTube, TikTok e Instagram. Luisardium está en YouTube. Luisarvoid está en YouTube, TikTok, Instagram y Facebook. Los enlaces están en la sección de canales de arriba.",
    },
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
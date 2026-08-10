export type SponsorPackage = {
  id: string
  name: string
  description: string
  stats: { label: string; value: string }[]
  price: string
  image: string
  caption: string
}

export const sponsorPackages: SponsorPackage[] = [
  {
    id: "sidebar",
    name: "Sidebar",
    description: "An exclusive placement in the desktop sidebar visible across every page.",
    stats: [
      { label: "Est. impressions", value: "200k+" },
      { label: "Est. clicks", value: "1,000+" },
    ],
    price: "$1,000 USD per week",
    image: "/sponsor/sponsor-sidebar.png",
    caption: "Uses your brand favicon",
  },
  {
    id: "feed",
    name: "Feed",
    description: "An interactive sponsor card fixed in the 3rd position of both the design and website feeds.",
    stats: [
      { label: "Est. impressions", value: "100k+" },
      { label: "Est. clicks", value: "500+" },
    ],
    price: "$1,250 USD per week",
    image: "/sponsor/sponsor-feed.png",
    caption: "Recommended creative size is 1440 x 900",
  },
  {
    id: "newsletter",
    name: "Newsletter",
    description: "A special introduction and call to action near the top of our weekly newsletter to 27k design creatives.",
    stats: [
      { label: "Est. opens", value: "11k+" },
      { label: "Est. clicks", value: "100+" },
    ],
    price: "$800 USD per issue",
    image: "/sponsor/sponsor-newsletter.png",
    caption: "Recommended creative size is 1440 x 900",
  },
]

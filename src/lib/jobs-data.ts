export type Job = {
  id: string
  company: string
  title: string
  location: string
  salary?: string
  posted: string
  logoBg: string
}

export const jobs: Job[] = [
  {
    id: "exa-brand",
    company: "Exa",
    title: "Brand Designer",
    location: "San Francisco",
    salary: "$150,000–$280,000",
    posted: "2w ago",
    logoBg: "bg-blue-600",
  },
  {
    id: "exa-design-eng",
    company: "Exa",
    title: "Design Engineer",
    location: "San Francisco",
    salary: "$150,000–$280,000",
    posted: "2w ago",
    logoBg: "bg-blue-600",
  },
  {
    id: "vercel-senior-pd",
    company: "Vercel",
    title: "Senior Product Designer",
    location: "San Francisco, New York, London, Berlin · Remote, United States",
    salary: "$156,000–$234,000",
    posted: "2w ago",
    logoBg: "bg-foreground",
  },
  {
    id: "aave-staff",
    company: "Aave Labs",
    title: "Staff Design Engineer",
    location: "Remote",
    posted: "2w ago",
    logoBg: "bg-neutral-800",
  },
  {
    id: "runway-sr",
    company: "Runway",
    title: "Sr./Staff Product Designer",
    location: "Remote, United States",
    salary: "$220,000–$290,000",
    posted: "2w ago",
    logoBg: "bg-neutral-900",
  },
  {
    id: "elevenlabs-pd",
    company: "ElevenLabs",
    title: "Product Designer",
    location: "London, New York, San Francisco, Warsaw · Remote",
    posted: "2w ago",
    logoBg: "bg-neutral-700",
  },
  {
    id: "vercel-visual",
    company: "Vercel",
    title: "Visual Designer, Web",
    location: "San Francisco, New York, London, Berlin · Remote, United States",
    salary: "$208,000–$312,000",
    posted: "2w ago",
    logoBg: "bg-foreground",
  },
  {
    id: "perplexity-dsl",
    company: "Perplexity",
    title: "Design Systems Lead",
    location: "San Francisco, New York · Remote, United States",
    salary: "$220,000–$280,000",
    posted: "2w ago",
    logoBg: "bg-neutral-900",
  },
  {
    id: "cursor-de",
    company: "Cursor",
    title: "Design Engineer",
    location: "San Francisco, New York",
    posted: "2w ago",
    logoBg: "bg-neutral-800",
  },
]

export type Skill = {
  id: string
  author: string
  description: string
  stars: string
  avatarBg: string
}

export type SkillCategory = {
  name: string
  skills: Skill[]
}

export const skillCategories: SkillCategory[] = [
  {
    name: "Interface",
    skills: [
      {
        id: "canvas-design",
        author: "anthropics/canvas-design",
        description: "Generate original visual art as polished PNG or PDF exports",
        stars: "161.4K",
        avatarBg: "bg-neutral-900",
      },
      {
        id: "quieter",
        author: "pbakaus/quieter",
        description: "Calm an overwhelming design without losing its impact",
        stars: "47K",
        avatarBg: "bg-amber-700",
      },
      {
        id: "distill",
        author: "pbakaus/distill",
        description: "Reduce UI complexity to reveal clarity and purpose",
        stars: "47K",
        avatarBg: "bg-amber-700",
      },
      {
        id: "critique",
        author: "pbakaus/critique",
        description: "Multi-lens UX critique with scoring and actionable feedback",
        stars: "47K",
        avatarBg: "bg-amber-700",
      },
      {
        id: "polish",
        author: "pbakaus/polish",
        description: "Elevate good UI to great with a meticulous pre-ship polish pass",
        stars: "47K",
        avatarBg: "bg-amber-700",
      },
      {
        id: "web-design-guidelines",
        author: "vercel-labs/web-design-guidelines",
        description: "Audit UI code for design and accessibility compliance",
        stars: "29.1K",
        avatarBg: "bg-foreground",
      },
      {
        id: "prototype",
        author: "emilkowalski/prototype",
        description: "Explore divergent UI directions with a live visual picker",
        stars: "21.5K",
        avatarBg: "bg-sky-300",
      },
      {
        id: "ui-skills",
        author: "ibelick/ui-skills",
        description: "Build agent-friendly interfaces with stronger defaults",
        stars: "3.4K",
        avatarBg: "bg-blue-600",
      },
      {
        id: "emil-design-eng",
        author: "emilkowalski/emil-design-eng",
        description: "Craft interfaces with polish, motion, and taste",
        stars: "3.1K",
        avatarBg: "bg-sky-300",
      },
      {
        id: "make-interfaces-feel-better",
        author: "jakubkrehel/make-interfaces-feel-better",
        description: "Polish UI details so interfaces feel intentional",
        stars: "1.7K",
        avatarBg: "bg-neutral-400",
      },
      {
        id: "userinterface-wiki",
        author: "raphaelsalaja/userinterface-wiki",
        description: "High-impact UI review rules for web interfaces",
        stars: "811",
        avatarBg: "bg-neutral-700",
      },
      {
        id: "oklch-skill",
        author: "jakubkrehel/oklch-skill",
        description: "Build perceptually balanced web color systems",
        stars: "157",
        avatarBg: "bg-neutral-400",
      },
      {
        id: "extract-design-system",
        author: "arvindrk/extract-design-system",
        description: "Turn public UI into starter design tokens",
        stars: "80",
        avatarBg: "bg-neutral-500",
      },
    ],
  },
  {
    name: "Research",
    skills: [
      {
        id: "grill-me",
        author: "mattpocock/grill-me",
        description: "Rigorous design grilling that exposes gaps and sharpens decisions",
        stars: "144.6K",
        avatarBg: "bg-neutral-500",
      },
    ],
  },
  {
    name: "Development",
    skills: [
      {
        id: "frontend-design",
        author: "anthropics/frontend-design",
        description: "Design distinctive, production-ready frontend interfaces",
        stars: "161.4K",
        avatarBg: "bg-neutral-900",
      },
    ],
  },
]

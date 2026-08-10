import Image from "next/image"
import { ArrowUpRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export type DesignCardData = {
  id: string
  image: string
  alt: string
  aspect: string
  avatarColor: string
  badge?: "star" | number
  tag: string
  title: string
  author: string
  description: string
  timeAgo: string
  impressions: string
  outbound: number
  source: string
  category: string
  style: string
  color: string
  interaction: string[]
}

export function DesignCard({
  card,
  onOpen,
}: {
  card: DesignCardData
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${card.title}`}
      className={cn(
        "group relative mb-4 block w-full overflow-hidden rounded-2xl bg-secondary text-left ring-0 ring-gold/0 transition-[transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold hover:ring-2 hover:ring-gold/50",
        card.aspect,
      )}
    >
      <Image
        src={card.image || "/placeholder.svg"}
        alt={card.alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />

      {card.badge === "star" && (
        <span className="absolute top-2.5 left-2.5 flex size-6 items-center justify-center rounded-full bg-gold-core text-background">
          <Star className="size-3.5 fill-current" aria-hidden="true" />
        </span>
      )}
      {typeof card.badge === "number" && (
        <span className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-foreground text-[12px] font-medium text-background">
          {card.badge}
        </span>
      )}

      <div className="absolute inset-0 flex items-end justify-between p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="flex items-center gap-1.5 rounded-full bg-background/90 py-1 pr-2.5 pl-1 backdrop-blur-sm">
          <span aria-hidden="true" className={cn("size-4 rounded-full", card.avatarColor)} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-foreground">{card.tag}</span>
        </span>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background/90 text-foreground">
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  )
}

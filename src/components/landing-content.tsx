import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { channels, shopFeatures, shopUrl, type Channel } from "@/lib/landing-data"
import { LandingFaq } from "@/components/landing-faq"
import { cn } from "@/lib/utils"

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <a
      href={channel.platforms[0]?.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-secondary text-left ring-0 ring-gold/0 transition-[transform,box-shadow] duration-200 hover:ring-2 hover:ring-gold/50",
        // NaferJ as the fourth card
        channel.behind && "z-10",
        !channel.behind && "z-20",
      )}
    >
      <div className="relative size-24 overflow-hidden sm:size-28">
        <Image
          src={`/landing/channels/${channel.id}.jpg`}
          alt={channel.name}
          fill
          sizes="112px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
    </a>
  )
}

export function LandingContent() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header — same pattern as Design page */}
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Luisardito</h1>
        <p className="text-[15px] text-muted-foreground">One creator, a whole community.</p>
      </div>

      {/* Hero — image with ambient blur glow (YouTube-style ambient mode) */}
      <section className="flex flex-col gap-4">
        <div className="relative min-h-48 w-full">
          {/* Ambient glow: blurred, scaled-up copy of the image bleeding out behind the hero */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-2 -inset-y-4 scale-[1.03] blur-2xl"
          >
            <Image
              src="/landing/hero.png"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover opacity-60"
            />
          </div>
          {/* The actual hero image, sharp and on top */}
          <div className="relative min-h-48 w-full overflow-hidden rounded-2xl bg-secondary">
            <Image
              src="/landing/hero.png"
              alt="Luisardito hero banner"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Channels — the 4 squares, NaferJ tucked behind Luisarvoid */}
      <section id="channels" className="flex flex-col gap-4 py-40">
        <div className="flex flex-wrap items-start gap-3">
          {channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-[15px] font-medium text-foreground">Shop</h2>
          <p className="text-[15px] text-muted-foreground">Rewards for the community.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {shopFeatures.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-1.5 rounded-2xl bg-secondary p-4">
              <span className="text-[13px] font-medium text-foreground">{feature.title}</span>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <a
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-gold px-3.5 text-[13px] font-medium text-gold-foreground transition-opacity hover:opacity-85"
        >
          Visit the shop
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      </section>

      {/* FAQ */}
      <LandingFaq />
    </div>
  )
}

import Image from "next/image"
import { ArrowUpRight, ShoppingBag } from "lucide-react"
import { communityFeatures, shopUrl, discordUrl, redditUrl } from "@/lib/landing-data"
import { LandingFaq } from "@/components/landing-faq"
import { LandingShowcase } from "@/components/landing-showcase"

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
            className="pointer-events-none absolute -inset-x-1 -inset-y-2 scale-[1.02] blur-xl"
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

      {/* Channels showcase — animated timed sequence */}
      <LandingShowcase />

      {/* Community — channels, community and shop rewards */}
      <section id="community" className="-mt-14 flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-[15px] font-medium text-foreground">Community</h2>
          <p className="text-[15px] text-muted-foreground">One creator, a whole universe.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {communityFeatures.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-1.5 rounded-2xl bg-secondary p-4">
              <span className="text-[13px] font-medium text-foreground">{feature.title}</span>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-gold px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
          >
            <ShoppingBag className="size-3.5" aria-hidden="true" />
            Visit the shop
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#5865F2" }}
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Discord
          </a>
          <a
            href={redditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#FF4500" }}
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.75.781 1.75 1.75 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.782-1.75 1.75-1.75.487 0 .926.198 1.242.512 1.179-.843 2.764-1.401 4.561-1.486l.842-3.94a.247.247 0 0 1 .282-.187l2.802.593a1.25 1.25 0 0 1 1.072-.603zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-2.74 3.65a.5.5 0 0 0-.5.5.5.5 0 0 0 .5.5h.01a.5.5 0 0 0 .5-.5.5.5 0 0 0-.5-.5h-.01z" />
            </svg>
            Reddit
          </a>
        </div>
      </section>

      {/* FAQ */}
      <LandingFaq />
    </div>
  )
}
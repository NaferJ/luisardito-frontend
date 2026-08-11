import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { shopFeatures, shopUrl } from "@/lib/landing-data"
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
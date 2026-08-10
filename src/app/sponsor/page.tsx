import Image from "next/image"
import { SiteShell } from "@/components/site-shell"
import { sponsorPackages } from "@/lib/sponsor-data"

export default function SponsorPage() {
  return (
    <SiteShell>
      <div className="flex flex-col gap-16">
        <div className="flex flex-col items-center gap-5 pt-6 text-center">
          <h1 className="max-w-lg text-4xl leading-tight font-semibold text-balance text-foreground sm:text-5xl">
            Broadcast to 200k+ creatives
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-pretty text-muted-foreground">
            Sponsor Recent with thoughtful placements across our site and weekly newsletter.
          </p>
        </div>

        <p className="max-w-2xl text-[14px] leading-relaxed text-pretty text-muted-foreground">
          Recent reaches nearly 200k people and more than 750k pageviews each month. Our weekly newsletter is sent
          only to recently active subscribers. It reaches 27k people, with an average open rate of 40 to 50%.
          <br />
          <br />
          About a third of the audience is in the US, Canada and Europe. Most people browse on desktop, and they
          come to Recent specifically for design inspiration, tools and creative work.
          <br />
          <br />
          We are selective about sponsors. The best fit is a product or service we would be comfortable recommending
          to the audience ourselves.
        </p>

        <div className="flex flex-col gap-12">
          {sponsorPackages.map((pkg) => (
            <div key={pkg.id} className="grid gap-6 lg:grid-cols-2 lg:items-start">
              <div className="flex flex-col gap-4">
                <h2 className="text-[15px] font-medium text-foreground">{pkg.name}</h2>
                <p className="max-w-sm text-[14px] leading-relaxed text-pretty text-muted-foreground">
                  {pkg.description}
                </p>
                <dl className="flex flex-col gap-1.5">
                  {pkg.stats.map((stat) => (
                    <div key={stat.label} className="flex items-baseline justify-between max-w-xs">
                      <dt className="text-[13px] text-muted-foreground">{stat.label}</dt>
                      <dd className="text-[13px] font-medium text-foreground">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-[14px] font-medium text-foreground">{pkg.price}</p>
                <button
                  type="button"
                  className="h-9 w-fit rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
                >
                  Book
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-secondary">
                  <Image src={pkg.image || "/placeholder.svg"} alt={`${pkg.name} placement preview`} fill className="object-cover" />
                </div>
                <p className="text-[13px] text-muted-foreground">{pkg.caption}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex max-w-2xl flex-col gap-4 border-t border-border pt-10">
          <p className="text-[14px] leading-relaxed text-pretty text-muted-foreground">
            The strongest campaigns meet designers in more than one place. Combine a site placement with the
            newsletter to build familiarity, extend your reach and give people more than one reason to take notice.
            <br />
            <br />
            If you have a specific launch, audience or creative requirement, we can shape a campaign around it. Tell
            us what you are trying to achieve and we will work out the best fit.
          </p>
          <a href="mailto:sponsor@recent.design" className="text-[14px] font-medium text-foreground underline underline-offset-4">
            Reach out
          </a>
        </div>
      </div>
    </SiteShell>
  )
}

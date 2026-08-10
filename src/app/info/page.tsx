import { SiteShell } from "@/components/site-shell"

export default function InfoPage() {
  return (
    <SiteShell>
      <div className="flex flex-col items-center gap-10 pt-6 text-center">
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-5xl font-semibold text-foreground sm:text-6xl">Info</h1>
          <p className="max-w-md text-[15px] leading-relaxed text-pretty text-muted-foreground">
            Recent is a curated feed of exceptional design, websites and digital products. It is built for
            designers, developers and anyone interested in thoughtful digital work.
          </p>
        </div>

        <div className="flex max-w-xl flex-col gap-4 text-left text-[14px] leading-relaxed text-pretty text-foreground">
          <p>
            Founded in 2023, Recent began as a way to collect the best design work posted on X into one place. In
            2026, we reignited the abandoned project and expanded to inspiration from Instagram, websites, tools and
            more.
          </p>
          <p>
            Recent also takes the place of Godly, the popular website inspiration gallery, with a broader feed that
            goes beyond sites alone.
          </p>
          <p>
            We take pride in our selections and always value quality over quantity. We aim to feature a broad range
            of work, but only when it feels like it belongs here.
          </p>
        </div>
      </div>
    </SiteShell>
  )
}

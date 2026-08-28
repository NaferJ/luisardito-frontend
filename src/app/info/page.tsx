import type { ComponentType } from "react"
import { SiteShell } from "@/components/site-shell"
import { makerSocials, kofiUrl } from "@/lib/landing-data"
import { GitHubLogo, InstagramLogo, XLogo, KofiLogo } from "@/components/brand-icons"

const MAKER_SOCIAL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  GitHub: GitHubLogo,
  Instagram: InstagramLogo,
  X: XLogo,
}

export default function InfoPage() {
  return (
    <SiteShell>
      <div className="flex flex-col items-center gap-10 pt-6 text-center">
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-5xl font-semibold text-foreground sm:text-6xl">Info</h1>
          <p className="max-w-md text-[15px] leading-relaxed text-pretty text-muted-foreground">
            Made by the community, for the community.
          </p>
        </div>

        <div className="flex max-w-xl flex-col gap-4 text-left text-[14px] leading-relaxed text-pretty text-foreground">
          <p>
            Three channels, one community. Luisardito, Luisardium and Luisarvoid, each with its own
            content and style.
          </p>
          <p>
            This is the place where all of it comes together — the channels, the community and the
            shop, the official rewards platform for being active.
          </p>
          <p>
            Built and maintained by NaferJ, who also owns the Luisarvoid channel. Made by the
            community, for the community.
          </p>
        </div>

        {/* Maker — NaferJ */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <div className="flex items-center gap-4">
            {makerSocials.map((social) => {
              const Icon = MAKER_SOCIAL_ICONS[social.label]
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-foreground"
                >
                  {Icon ? <Icon className="size-5" /> : null}
                </a>
              )
            })}
            <a
              href={kofiUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Support on Ko-fi"
            >
              <KofiLogo className="size-5 text-[#FF5E5B]" />
            </a>
          </div>
        </div>
      </div>
    </SiteShell>
  )
}

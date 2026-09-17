import type { ComponentType } from "react"
import { SiteShell } from "@/components/site-shell"
import { makerSocials, kofiUrl } from "@/lib/landing-data"
import { getDictionary } from "@/lib/i18n"
import { GitHubLogo, InstagramLogo, XLogo, KofiLogo } from "@/components/brand-icons"

const MAKER_SOCIAL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  GitHub: GitHubLogo,
  Instagram: InstagramLogo,
  X: XLogo,
}

export default async function InfoPage() {
  const dictionary = await getDictionary()
  const info = dictionary.info
  return (
    <SiteShell>
      <div className="flex flex-col items-center gap-10 pt-6 text-center">
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-5xl font-semibold text-foreground sm:text-6xl">Info</h1>
          <p className="max-w-md text-[15px] leading-relaxed text-pretty text-muted-foreground">
            {info.tagline}
          </p>
        </div>

        <div className="flex max-w-xl flex-col gap-4 text-left text-[14px] leading-relaxed text-pretty text-foreground">
          <p>{info.p1}</p>
          <p>{info.p2}</p>
          <p>{info.p3}</p>
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
              aria-label={info.kofiLabel}
            >
              <KofiLogo className="size-5 text-[#FF5E5B]" />
            </a>
          </div>
        </div>
      </div>
    </SiteShell>
  )
}

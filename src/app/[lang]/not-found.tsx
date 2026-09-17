import { LocaleLink } from "@/components/i18n/locale-link"
import { getDictionary } from "@/lib/i18n"
import { SiteShell } from "@/components/site-shell"

export default async function NotFound() {
  const dictionary = await getDictionary()
  return (
    <SiteShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-[15px] font-medium text-gold-bright">404</h1>
          <p className="text-[15px] text-foreground">{dictionary.common.notFound}</p>
        </div>
        <LocaleLink href="/" className="flex h-8 items-center justify-center rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85">
          {dictionary.common.backHome}
        </LocaleLink>
      </div>
    </SiteShell>
  )
}

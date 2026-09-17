"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { formatCompactNumber } from "@/lib/utils"
import { useI18n } from "@/components/i18n/provider"
import { hasLocale } from "@/lib/i18n/locales"

export function OnlineStatus({ base = 28 }: Readonly<{ base?: number }>) {
  const pathname = usePathname()
  const { dictionary } = useI18n()
  const segments = pathname.split("/")
  const pathWithoutLocale = hasLocale(segments[1])
    ? `/${segments.slice(2).join("/")}`
    : pathname
  const isLanding = pathWithoutLocale === "/"
  // Green on the landing page, gold everywhere else — matches the side-decor palette.
  const dotColor = isLanding ? "#588C23" : "var(--gold)"

  const [count, setCount] = useState(base)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => Math.max(base - 4, Math.min(base + 4, c + (Math.random() > 0.5 ? 1 : -1))))
    }, 4000)
    return () => clearInterval(interval)
  }, [base])

  return (
    <div className="flex items-center gap-1.5 font-mono text-[13px] text-muted-foreground">
      <span className="relative flex size-1.5">
        <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ backgroundColor: dotColor }} />
        <span aria-hidden="true" className="relative size-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
      </span>
      <span className="text-foreground">{formatCompactNumber(count)}</span> {dictionary.common.online}
    </div>
  )
}

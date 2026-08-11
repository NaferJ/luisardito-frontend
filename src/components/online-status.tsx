"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function OnlineStatus({ base = 28 }: { base?: number }) {
  const pathname = usePathname()
  const isLanding = pathname === "/"
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
      <span className="text-foreground">{count}</span> online
    </div>
  )
}

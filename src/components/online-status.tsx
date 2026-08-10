"use client"

import { useEffect, useState } from "react"

export function OnlineStatus({ base = 28 }: { base?: number }) {
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
        <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-signal opacity-60" />
        <span aria-hidden="true" className="relative size-1.5 rounded-full bg-signal" />
      </span>
      <span className="text-foreground">{count}</span> online
    </div>
  )
}

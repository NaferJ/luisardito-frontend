"use client"

import { useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import type { ChangelogRelease } from "@/content/changelog/types"

const tagStyles: Record<
  ChangelogRelease["changes"][number]["type"],
  string
> = {
  added: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  improved: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  fixed: "bg-destructive/15 text-destructive",
}

const tagLabels: Record<
  ChangelogRelease["changes"][number]["type"],
  string
> = {
  added: "Added",
  improved: "Improved",
  fixed: "Fixed",
}

function formatDate(iso: string): string {
  const date = new Date(iso + "T00:00:00")
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function ChangelogReleaseCard({
  release,
  defaultExpanded,
}: Readonly<{
  release: ChangelogRelease
  defaultExpanded: boolean
}>) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <article className="rounded-lg border border-border bg-secondary/30 p-4">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 text-left"
        aria-expanded={expanded}
      >
        <span className="rounded-md bg-foreground px-2 py-1 font-mono text-xs font-semibold text-background">
          {release.version}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {release.title}
        </span>
        <span className="hidden items-center gap-1.5 font-mono text-xs text-muted-foreground sm:flex">
          <Calendar className="size-3.5" />
          {formatDate(release.date)}
        </span>
        <span className="text-xs text-muted-foreground">
          {release.changes.length}{" "}
          {release.changes.length === 1 ? "change" : "changes"}
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <div
        className="grid transition-all duration-200 ease-out"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {release.changes.map((change, index) => (
              <li
                key={`${change.type}-${index}`}
                className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3"
              >
                <span
                  className={`inline-flex w-fit shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tagStyles[change.type]}`}
                >
                  {tagLabels[change.type]}
                </span>
                <span className="text-sm leading-relaxed text-foreground">
                  {change.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

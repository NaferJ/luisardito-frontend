import Link from "next/link"
import { jobs } from "@/lib/jobs-data"

export function JobListingsPanel() {
  const featured = jobs.slice(0, 4)

  return (
    <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <span className="text-[13px] font-medium text-foreground">Active job listings</span>
      <div className="flex flex-col gap-3.5">
        {featured.map((job) => (
          <div key={job.id} className="flex items-center gap-2.5">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-background ${job.logoBg}`}
              aria-hidden="true"
            >
              {job.company.slice(0, 1)}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-medium text-foreground">{job.company}</span>
              <span className="truncate text-[13px] text-muted-foreground">{job.title}</span>
            </div>
          </div>
        ))}
      </div>
      <Link href="/jobs" className="text-[13px] font-medium text-foreground underline underline-offset-4">
        See all jobs
      </Link>
    </div>
  )
}

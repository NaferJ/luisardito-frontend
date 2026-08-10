import { SiteShell } from "@/components/site-shell"
import { jobs } from "@/lib/jobs-data"

export default function JobsPage() {
  return (
    <SiteShell>
      <div className="flex flex-col gap-16">
        <div className="flex flex-col items-center gap-5 pt-6 text-center">
          <h1 className="max-w-xl text-4xl leading-tight font-semibold text-balance text-foreground sm:text-5xl">
            Design roles from the best companies.
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-pretty text-muted-foreground">
            Browse open design and design engineering roles from teams building things worth paying attention to.
          </p>
          <button
            type="button"
            className="h-10 rounded-full bg-foreground px-5 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
          >
            Post a job for $149
          </button>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Reach 250k+ monthly creatives and
            <br />
            25k+ newsletter subscribers
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className={`flex items-center gap-4 px-4 py-4 ${i % 2 === 1 ? "bg-secondary" : "bg-card"}`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold text-background ${job.logoBg}`}
                aria-hidden="true"
              >
                {job.company.slice(0, 1)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
                <span className="text-[14px] font-medium text-foreground">{job.title}</span>
                <span className="truncate text-[13px] text-muted-foreground">{job.location}</span>
              </div>
              {job.salary && (
                <span className="hidden shrink-0 text-[13px] text-muted-foreground sm:inline">{job.salary}</span>
              )}
              <span className="shrink-0 text-[13px] text-muted-foreground">{job.posted}</span>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  )
}

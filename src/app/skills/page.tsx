import { GitFork, Copy } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { skillCategories } from "@/lib/skills-data"

export default function SkillsPage() {
  return (
    <SiteShell>
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-[15px] font-medium text-foreground">Skills</h1>
          <p className="text-[15px] text-muted-foreground">The best design skills on the Internet.</p>
        </div>

        {skillCategories.map((category) => (
          <section key={category.name} className="flex flex-col gap-4">
            <h2 className="text-[14px] font-medium text-foreground">
              {category.name} <span className="text-muted-foreground">{category.skills.length} skills</span>
            </h2>

            <div className="overflow-hidden rounded-2xl border border-border">
              {category.skills.map((skill, i) => (
                <div
                  key={skill.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i % 2 === 1 ? "bg-secondary" : "bg-card"}`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-background ${skill.avatarBg}`}
                    aria-hidden="true"
                  >
                    {skill.author.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="w-64 shrink-0 truncate font-mono text-[13px] text-foreground">
                    {skill.author}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
                    {skill.description}
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 text-[13px] text-muted-foreground sm:flex">
                    <GitFork className="size-3.5" aria-hidden="true" />
                    {skill.stars}
                  </span>
                  <button
                    type="button"
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <Copy className="size-3.5" aria-hidden="true" />
                    Install
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </SiteShell>
  )
}

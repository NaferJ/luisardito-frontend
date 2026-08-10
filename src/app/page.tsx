import { SiteShell } from "@/components/site-shell"
import { FilterPills } from "@/components/filter-pills"
import { DesignFeed } from "@/components/design-feed"
import { designCards } from "@/lib/design-cards-data"

export default function DesignPage() {
  return (
    <SiteShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-[15px] font-medium text-foreground">Design</h1>
          <p className="text-[15px] text-muted-foreground">The best design inspiration on the Internet.</p>
        </div>

        <FilterPills />

        <DesignFeed cards={designCards} />
      </div>
    </SiteShell>
  )
}

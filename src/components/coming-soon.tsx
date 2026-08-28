export function ComingSoon({ title, description }: Readonly<{ title: string; description: string }>) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">{title}</h1>
        <p className="text-[15px] text-muted-foreground">{description}</p>
      </div>
      <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-border">
        <p className="text-[13px] text-muted-foreground">More {title.toLowerCase()} coming soon.</p>
      </div>
    </div>
  )
}

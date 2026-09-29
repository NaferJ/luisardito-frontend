import { Bookmark, ChartNoAxesColumn, Heart, MessageCircle, Repeat2, Share, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CommunityMockPost } from "./mock-data"

const ICON = "size-[18px] @min-[40rem]:size-[22px]"

function Action({ icon: Icon, count }: Readonly<{ icon: typeof Heart; count?: string }>) {
  return (
    <span className="flex items-center gap-1.5 text-[13px] transition-colors hover:text-foreground @min-[40rem]:gap-2 @min-[40rem]:text-[15px]">
      <Icon className={ICON} />
      {count}
    </span>
  )
}

export function CommunityPostCard({ post }: Readonly<{ post: CommunityMockPost }>) {
  return (
    <article className="relative flex w-fit max-w-full gap-3 border border-border bg-background p-4 @min-[40rem]:gap-6 @min-[40rem]:p-7">
      <span
        aria-hidden="true"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-base font-semibold text-background @min-[40rem]:size-12 @min-[40rem]:text-lg",
          post.accent,
        )}
      >
        {post.author.charAt(0).toUpperCase()}
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="truncate text-base font-medium text-foreground @min-[40rem]:text-lg">{post.author}</span>
          <span className="truncate text-sm text-muted-foreground @min-[40rem]:text-base">@{post.author}</span>
          <span aria-hidden="true" className="text-sm text-muted-foreground @min-[40rem]:text-base">·</span>
          <span className="shrink-0 text-sm text-muted-foreground @min-[40rem]:text-base">{post.time}</span>
        </div>

        <p className="mt-1 text-base leading-relaxed text-foreground [overflow-wrap:anywhere] @min-[40rem]:text-lg">
          {post.text}
        </p>

        {post.image && (
          <div className="mt-3 flex aspect-[16/9] w-[40rem] max-w-full items-center justify-center rounded-sm border border-border bg-muted">
            <ImageIcon className="size-12 text-muted-foreground/40" />
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2 text-muted-foreground @min-[40rem]:gap-6">
          <Action icon={MessageCircle} count={post.comments} />
          <Action icon={Repeat2} count={post.reposts} />
          <Action icon={Heart} count={post.likes} />
          <Action icon={ChartNoAxesColumn} count={post.views} />
          <span className="flex items-center gap-3 @min-[40rem]:gap-6">
            <Bookmark className={cn(ICON, "transition-colors hover:text-foreground")} />
            <Share className={cn(ICON, "transition-colors hover:text-foreground")} />
          </span>
        </div>
      </div>
    </article>
  )
}

import { Award, ChartNoAxesColumn, Heart, MessageCircle, Share, Image as ImageIcon } from "lucide-react"
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

function Avatar({ name, accent, className }: Readonly<{ name: string; accent: string; className?: string }>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-background",
        accent,
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export function CommunityPostCard({ post, commentLabel }: Readonly<{ post: CommunityMockPost; commentLabel: string }>) {
  const comment = post.bestComment
  return (
    <article className="relative flex w-fit max-w-full flex-col border-[0.5px] border-border/50 bg-background p-4 @min-[40rem]:p-7">
      <div className="flex gap-3 @min-[40rem]:gap-6">
        <div className="flex w-10 shrink-0 flex-col items-center @min-[40rem]:w-12">
          <Avatar name={post.author} accent={post.accent} className="size-10 text-base @min-[40rem]:size-12 @min-[40rem]:text-lg" />
          {comment && <span aria-hidden="true" className="mt-1.5 w-px min-h-4 grow bg-border/70" />}
        </div>

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
            <div className="mt-3 flex aspect-[16/9] w-[40rem] max-w-full items-center justify-center rounded-sm border-[0.5px] border-border/50 bg-muted">
              <ImageIcon className="size-12 text-muted-foreground/40" />
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 text-muted-foreground @min-[40rem]:gap-6">
            <Action icon={MessageCircle} count={post.comments} />
            <Action icon={Heart} count={post.likes} />
            <Action icon={ChartNoAxesColumn} count={post.views} />
            <Share className={cn(ICON, "transition-colors hover:text-foreground")} />
          </div>
        </div>
      </div>

      {comment && (
        <>
        <div aria-hidden="true" className="flex h-3.5 @min-[40rem]:h-4">
          <div className="flex w-10 shrink-0 justify-center @min-[40rem]:w-12">
            <span className="w-px bg-border/70" />
          </div>
        </div>
        <div className="flex gap-3 @min-[40rem]:gap-6">
          <div className="relative flex w-10 shrink-0 flex-col items-center @min-[40rem]:w-12">
            <span aria-hidden="true" className="h-4 w-px bg-border/70 @min-[40rem]:h-5" />
            <span aria-hidden="true" className="absolute top-4 left-1/2 h-px w-[calc(50%+0.75rem)] bg-border/70 @min-[40rem]:top-5 @min-[40rem]:w-[calc(50%+1.5rem)]" />
          </div>
          <div className="flex min-w-0 flex-1 gap-3 @min-[40rem]:gap-4">
            <Avatar name={comment.author} accent={comment.accent} className="size-8 text-sm @min-[40rem]:size-10 @min-[40rem]:text-base" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gold-core @min-[40rem]:text-[13px]">
                <Award className="size-3.5 @min-[40rem]:size-4" />
                {commentLabel}
              </span>
              <div className="flex min-w-0 items-baseline gap-1.5">
                <span className="truncate text-sm font-medium text-foreground @min-[40rem]:text-base">{comment.author}</span>
                <span className="truncate text-[13px] text-muted-foreground @min-[40rem]:text-sm">@{comment.author}</span>
                <span aria-hidden="true" className="text-[13px] text-muted-foreground @min-[40rem]:text-sm">·</span>
                <span className="shrink-0 text-[13px] text-muted-foreground @min-[40rem]:text-sm">{comment.time}</span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-foreground [overflow-wrap:anywhere] @min-[40rem]:text-base">
                {comment.text}
              </p>
              <div className="mt-2 flex items-center gap-6 text-muted-foreground">
                <Action icon={MessageCircle} count={comment.comments} />
                <Action icon={Heart} count={comment.likes} />
                <Action icon={ChartNoAxesColumn} count={comment.views} />
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </article>
  )
}

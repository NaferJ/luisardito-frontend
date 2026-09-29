"use client"

import { useRef, useState } from "react"
import { ImagePlus, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/provider"
import { useUser } from "@/components/user-provider"
import { cn } from "@/lib/utils"

const MAX_IMAGES = 4

export function CommunityComposer() {
  const { dictionary } = useI18n()
  const t = dictionary.community
  const user = useUser()
  const [text, setText] = useState("")
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const name = user?.kick_data?.username ?? user?.nickname ?? user?.nombre ?? "User"
  const avatar = user?.kick_data?.avatar_url ?? user?.kick_avatar ?? user?.avatar_url ?? undefined
  const canPost = text.trim().length > 0 || images.length > 0

  function addImages(files: FileList | null) {
    if (!files) return
    const urls = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...urls].slice(0, MAX_IMAGES))
  }

  return (
    <div className="relative flex w-full flex-col border border-border bg-background p-7">
      <div className="flex gap-6">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="size-12 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <User className="size-4" />
          </span>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.composerPlaceholder}
          rows={2}
          className="field-sizing-content min-h-9 w-full resize-none bg-transparent py-1.5 text-lg leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {images.map((src, i) => (
            <div key={src} className="group relative aspect-square overflow-hidden rounded-sm border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label={t.removeImage}
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-sm bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t.addPhoto}
            title={t.addPhoto}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              images.length >= MAX_IMAGES && "pointer-events-none opacity-40",
            )}
          >
            <ImagePlus className="size-[22px]" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addImages(e.target.files)
              e.target.value = ""
            }}
          />
        </div>
        <Button size="sm" disabled={!canPost}>
          {t.post}
        </Button>
      </div>
    </div>
  )
}

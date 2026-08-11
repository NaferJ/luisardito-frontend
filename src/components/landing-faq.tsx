"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { faqItems } from "@/lib/landing-data"

export function LandingFaq() {
  return (
    <section id="faq" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-[15px] font-medium text-foreground">FAQ</h2>
        <p className="text-[15px] text-muted-foreground">Questions, answered.</p>
      </div>

      <div className="flex flex-col gap-2">
        {faqItems.map((item) => (
          <FaqItem key={item.question} item={item} />
        ))}
      </div>
    </section>
  )
}

function FaqItem({
  item,
}: {
  item: { question: string; answer: string }
}) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [open])

  return (
    <div
      onClick={() => setOpen((prev) => !prev)}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setOpen((prev) => !prev)
        }
      }}
      className="cursor-pointer overflow-hidden rounded-2xl bg-secondary"
    >
      <div className="flex w-full items-center justify-between gap-3 p-4 text-left text-[13px] font-medium text-foreground">
        <span>{item.question}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>
      <div
        style={{
          maxHeight: open ? `${height}px` : "0px",
          opacity: open ? 1 : 0,
        }}
        className="transition-[max-height,opacity] duration-300 ease-out overflow-hidden"
      >
        <div ref={contentRef} className="px-4 pb-4 text-[13px] leading-relaxed text-muted-foreground">
          {item.answer}
        </div>
      </div>
    </div>
  )
}

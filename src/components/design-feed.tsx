"use client"

import { useState } from "react"
import { DesignCard, type DesignCardData } from "@/components/design-card"
import { DesignDetailOverlay } from "@/components/design-detail-overlay"
import { JobListingsPanel } from "@/components/job-listings-panel"

export function DesignFeed({ cards }: { cards: DesignCardData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:break-inside-avoid">
        {cards.slice(0, 2).map((card, i) => (
          <DesignCard key={card.id} card={card} onOpen={() => setOpenIndex(i)} />
        ))}
        <JobListingsPanel />
        {cards.slice(2).map((card, i) => (
          <DesignCard key={card.id} card={card} onOpen={() => setOpenIndex(i + 2)} />
        ))}
      </div>

      {openIndex !== null && (
        <DesignDetailOverlay
          cards={cards}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  )
}

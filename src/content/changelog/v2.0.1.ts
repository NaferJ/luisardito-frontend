import type { ChangelogRelease } from "./types"

const release: ChangelogRelease = {
  version: "v2.0.1",
  date: "2026-08-28",
  title: "Under the hood cleanup — faster, cleaner, more accessible.",
  changes: [
    {
      type: "fixed",
      text: "Improved keyboard navigation across the admin panel — buttons and clickable rows now work with Enter and Space keys.",
    },
    {
      type: "improved",
      text: "Cleaner code behind the scenes — simplified complex logic in the kick config and product detail pages for better performance.",
    },
    {
      type: "fixed",
      text: "Better form labels and screen reader support in the product editor.",
    },
    {
      type: "improved",
      text: "Smoother sorting and filtering in the promotions and history pages.",
    },
  ],
}

export default release

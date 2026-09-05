import type { ChangelogRelease } from "./types"

const release: ChangelogRelease = {
  version: "v2.2.0",
  date: "2026-09-05",
  title: "A clearer history for every reward you redeem.",
  changes: [
    {
      type: "improved",
      text: "My Redemptions now loads history page by page, so large redemption histories stay quick and easy to scan.",
    },
    {
      type: "improved",
      text: "Status filters, date sorting, and pagination now work together through the redemption history URL.",
    },
    {
      type: "improved",
      text: "Redemption cards now give product, points, date, and delivery status a clearer visual hierarchy across mobile and desktop.",
    },
    {
      type: "fixed",
      text: "Removed an unsupported delivery-time promise from the redemption history page.",
    },
  ],
}

export default release

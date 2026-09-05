import type { ChangelogRelease } from "./types"

const release: ChangelogRelease = {
  version: "v2.1.0",
  date: "2026-09-05",
  title: "Subscriber badges — show your support tenure.",
  changes: [
    {
      type: "added",
      text: "Tiered subscriber badges now appear on the leaderboard, top earners, profile, account pill, and admin user views — one badge per month subscribed, up to 6 months.",
    },
    {
      type: "added",
      text: "Hover over any subscriber or VIP badge to see a tooltip describing what it means.",
    },
    {
      type: "improved",
      text: "VIP badges now show in the account pill and sidebar when the user has VIP status.",
    },
    {
      type: "improved",
      text: "Top earners widget no longer shows the redundant 'pts' label next to points.",
    },
  ],
}

export default release

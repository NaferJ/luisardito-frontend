import type { ChangelogRelease } from "./types"

const release: ChangelogRelease = {
  version: "v2.0.0",
  date: "2026-08-28",
  title: "Welcome to v2.0 — a complete rebuild with a full shop, admin panel, and live leaderboard.",
  changes: [
    {
      type: "added",
      text: "Full shop experience — browse products, redeem with points, and track your redemptions.",
    },
    {
      type: "added",
      text: "Leaderboard with live rankings, stats, reset countdown, and your pinned position.",
    },
    {
      type: "added",
      text: "Profile page showing your points, VIP status, subscriber badge, and account info.",
    },
    {
      type: "added",
      text: "Points history page to track every points change with reasons.",
    },
    {
      type: "added",
      text: "Bot commands page showing all available chat commands and their status.",
    },
    {
      type: "added",
      text: "Promotions page showing active deals and discount codes.",
    },
    {
      type: "added",
      text: "Admin panel for staff — manage redemptions, users, products, promotions, commands, and Kick config.",
    },
    {
      type: "added",
      text: "Changelog page so you can see what's new in each update.",
    },
    {
      type: "improved",
      text: "Navigation reorganized with clear sections and proper active highlighting.",
    },
    {
      type: "improved",
      text: "Kick logo updated to the official brand logo across the site.",
    },
    {
      type: "fixed",
      text: "Redemptions page now loads correctly without errors.",
    },
    {
      type: "fixed",
      text: "User profiles and points updates now work reliably.",
    },
    {
      type: "fixed",
      text: "Bot commands page now shows all fields correctly.",
    },
  ],
}

export default release

import type { ChangelogRelease } from "./types"

const release: ChangelogRelease = {
  version: "v2.0.0",
  date: "2025-01-01",
  title: "Admin rebuild, leaderboard redesign, and platform-wide polish.",
  changes: [
    {
      type: "added",
      text: "Admin redemptions page with detail drawer, bulk actions, real-time polling, CSV export, date range filter, sortable columns, and pagination.",
    },
    {
      type: "added",
      text: "Admin users page with stats cards, role filters, detail drawer, and CSV export.",
    },
    {
      type: "added",
      text: "Admin promotions page with stats cards, filters, sortable columns, pagination, CSV export, and detail drawer with live statistics.",
    },
    {
      type: "added",
      text: "Admin commands page with stats cards, filters, sortable columns, pagination, CSV export, and detail drawer.",
    },
    {
      type: "added",
      text: "Admin Kick configuration page with categorized points config, per-entry enabled toggles, VIP configuration, and migration controls.",
    },
    {
      type: "added",
      text: "Leaderboard redesigned with clean list design, stats header, reset countdown, pinned position, and load-more pagination.",
    },
    {
      type: "added",
      text: "Changelog page with collapsible releases.",
    },
    {
      type: "added",
      text: "Public API client for client-safe fetches without server-only dependencies.",
    },
    {
      type: "added",
      text: "GitHub Actions CI workflow for lint and build verification.",
    },
    {
      type: "added",
      text: "Deploy checklist and expanded environment variable documentation.",
    },
    {
      type: "improved",
      text: "Sidebar navigation reorganized with proper section titles and active state matching for sub-routes.",
    },
    {
      type: "improved",
      text: "Kick logo replaced with official brand logo across all pages.",
    },
    {
      type: "improved",
      text: "Admin pages unified with consistent drawer, stats, CSV, and filters pattern.",
    },
    {
      type: "improved",
      text: "Package version bumped to 2.0.0.",
    },
    {
      type: "fixed",
      text: "Sequelize capitalization mismatch (Usuario/Producto) in redemptions backend contract.",
    },
    {
      type: "fixed",
      text: "Backend users contract bugs (vip_status not vip_info, operation not modo, motivo required).",
    },
    {
      type: "fixed",
      text: "User-facing redemptions page capitalization bug.",
    },
    {
      type: "fixed",
      text: "Kick points config server action sending wrong JSON shape.",
    },
    {
      type: "fixed",
      text: "Bot commands admin missing auto_send_interval_seconds and dynamic_handler fields.",
    },
  ],
}

export default release

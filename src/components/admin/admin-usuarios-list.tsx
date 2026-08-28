"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Crown,
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Calendar,
  Users,
  Crown as CrownIcon,
  Star as StarIcon,
  Shield,
  AlertTriangle,
  X,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { downloadCSV } from "@/lib/admin-csv"
import { PAGE_SIZE_OPTIONS, DATE_PRESETS, getDateRangeStart } from "@/lib/admin-utils"
import type { DatePreset } from "@/lib/admin-utils"
import { DiscordLogo } from "@/components/brand-icons"
import type { AdminUsuario } from "@/lib/admin"
import type { Canje } from "@/types"

// ─── Types ───

type SortKey = "nickname" | "puntos" | "creado" | "canjes"
type SortDir = "asc" | "desc"
type RoleFilter = "all" | "vip" | "sub" | "admin" | "discord"

// ─── Constants ───

const COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: "nickname", label: "Name", className: "min-w-0 flex-1" },
  { key: "canjes", label: "Canjes", className: "w-20 shrink-0 text-right" },
  { key: "puntos", label: "Points", className: "w-28 shrink-0 text-right" },
  { key: "creado", label: "Joined", className: "w-28 shrink-0 text-right" },
]

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "vip", label: "VIP" },
  { value: "sub", label: "Subs" },
  { value: "admin", label: "Admins" },
  { value: "discord", label: "Discord" },
]

// ─── Helpers ───

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "today"
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function formatDateLong(d: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(d))
}

function userName(u: AdminUsuario): string {
  return u.kick_data?.username ?? u.nickname ?? u.nombre ?? u.email
}

function userAvatar(u: AdminUsuario): string | undefined {
  return u.kick_data?.avatar_url ?? u.kick_avatar ?? u.avatar_url ?? undefined
}

function isVip(u: AdminUsuario): boolean {
  return u.vip_status?.is_active ?? u.vip_info?.is_active ?? u.is_vip ?? false
}

function isSub(u: AdminUsuario): boolean {
  return u.subscriber_status?.is_active ?? false
}

function isAdmin(u: AdminUsuario): boolean {
  return [3, 4, 5].includes(u.rol_id)
}

function hasDiscord(u: AdminUsuario): boolean {
  return u.discord_info?.linked ?? u.discordLinked ?? false
}

function discordName(u: AdminUsuario): string | undefined {
  return u.discord_info?.display_name ?? u.discord_info?.username ?? u.discordUsername ?? u.discord_username ?? undefined
}

function getDateRange(preset: DatePreset): { start: number | null } {
  return { start: getDateRangeStart(preset) }
}

function exportCSV(usuarios: AdminUsuario[]): void {
  const headers = ["ID", "Name", "Discord", "Email", "Points", "Canjes", "Pending", "VIP", "Sub", "Admin", "Joined"]
  const rows = usuarios.map((u) => [
    u.id,
    userName(u),
    discordName(u) ?? "Not linked",
    u.email,
    u.puntos,
    u.total_canjes ?? 0,
    u.canjes_pendientes ?? 0,
    isVip(u) ? "Yes" : "No",
    isSub(u) ? "Yes" : "No",
    isAdmin(u) ? "Yes" : "No",
    new Date(u.creado).toISOString(),
  ])
  downloadCSV("users", headers, rows)
}

// ─── Component ───

export function AdminUsuariosList({
  usuarios,
  canjesByUser,
}: {
  usuarios: AdminUsuario[]
  canjesByUser?: Record<number, Canje[]>
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [datePreset, setDatePreset] = useState<DatePreset>("all")
  const [sortKey, setSortKey] = useState<SortKey>("puntos")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20)
  const [currentPage, setCurrentPage] = useState(1)

  // Detail drawer
  const [drawerIndex, setDrawerIndex] = useState<number | null>(null)

  // ─── Stats ───
  const stats = useMemo(() => {
    const total = usuarios.length
    const vips = usuarios.filter(isVip).length
    const subs = usuarios.filter(isSub).length
    const admins = usuarios.filter(isAdmin).length
    const withDiscord = usuarios.filter(hasDiscord).length
    return { total, vips, subs, admins, withDiscord }
  }, [usuarios])

  // ─── Filter + sort ───
  const filtered = useMemo(() => {
    let result = usuarios
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter(
        (u) =>
          userName(u).toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.kick_username?.toLowerCase().includes(term) ?? false) ||
          (discordName(u)?.toLowerCase().includes(term) ?? false),
      )
    }
    switch (roleFilter) {
      case "vip": result = result.filter(isVip); break
      case "sub": result = result.filter(isSub); break
      case "admin": result = result.filter(isAdmin); break
      case "discord": result = result.filter(hasDiscord); break
    }
    const { start } = getDateRange(datePreset)
    if (start !== null) {
      result = result.filter((u) => new Date(u.creado).getTime() >= start)
    }
    const sorted = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "nickname": cmp = userName(a).localeCompare(userName(b)); break
        case "puntos": cmp = a.puntos - b.puntos; break
        case "creado": cmp = new Date(a.creado).getTime() - new Date(b.creado).getTime(); break
        case "canjes": cmp = (a.total_canjes ?? 0) - (b.total_canjes ?? 0); break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [usuarios, search, roleFilter, datePreset, sortKey, sortDir])

  // ─── Pagination ───
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="size-3 opacity-30" />
    return sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
  }

  const onSearchChange = (v: string) => { setSearch(v); setCurrentPage(1) }
  const onRoleChange = (v: RoleFilter) => { setRoleFilter(v); setCurrentPage(1) }
  const onDateChange = (v: DatePreset) => { setDatePreset(v); setCurrentPage(1) }
  const onPageSizeChange = (s: (typeof PAGE_SIZE_OPTIONS)[number]) => { setPageSize(s); setCurrentPage(1) }

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-6 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          drawerIndex !== null && "lg:translate-x-[292px]",
        )}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-[15px] font-medium text-foreground">Users</h1>
            <span className="text-[13px] text-muted-foreground">
              {filtered.length} of {usuarios.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 items-center">
              <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search name, email, Discord..."
                aria-label="Search users"
                className="h-8 w-52 rounded-full border border-border bg-secondary pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:w-64 focus:border-gold focus:outline-none transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => exportCSV(filtered)}
              className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
              aria-label="Export CSV"
              title="Export filtered results as CSV"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={<Users className="size-3.5" />} label="Total" value={stats.total} />
          <StatCard icon={<CrownIcon className="size-3.5" />} label="VIP" value={stats.vips} valueClass="text-gold-bright" />
          <StatCard icon={<StarIcon className="size-3.5" />} label="Subs" value={stats.subs} />
          <StatCard icon={<Shield className="size-3.5" />} label="Admins" value={stats.admins} />
          <StatCard icon={<DiscordLogo className="size-3.5" />} label="Discord" value={stats.withDiscord} />
        </div>

        {/* Filters row: role pills + date range */}
        <div className="flex flex-wrap items-center gap-2">
          {ROLE_FILTERS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onRoleChange(opt.value)}
              aria-pressed={roleFilter === opt.value}
              className={cn(
                "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
                roleFilter === opt.value
                  ? "bg-gold text-gold-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground" />
            <select
              value={datePreset}
              onChange={(e) => onDateChange(e.target.value as DatePreset)}
              className="h-7 rounded-full border border-border bg-background px-3 text-[12px] text-foreground focus:border-gold focus:outline-none"
              aria-label="Join date range"
            >
              {DATE_PRESETS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {paginated.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            {/* Column headers */}
            <div className="flex items-center gap-4 border-b border-border bg-secondary/50 px-4 py-2.5">
              <span className="w-10 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Avatar
              </span>
              {COLUMNS.map((col) => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className={cn(
                    "flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                    col.className,
                    (col.key === "puntos" || col.key === "creado" || col.key === "canjes") && "justify-end",
                  )}
                >
                  {col.label}
                  <SortIcon column={col.key} />
                </button>
              ))}
              <span className="w-20 shrink-0 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Badges
              </span>
              <span className="w-8 shrink-0" />
            </div>

            {/* Rows */}
            <div className="flex flex-col">
              {paginated.map((u) => {
                const avatar = userAvatar(u)
                const vip = isVip(u)
                const sub = isSub(u)
                const admin = isAdmin(u)
                const discord = hasDiscord(u)
                const dName = discordName(u)
                const idx = filtered.indexOf(u)

                return (
                  <div
                    key={u.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setDrawerIndex(idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setDrawerIndex(idx)
                      }
                    }}
                    className="flex cursor-pointer items-center gap-4 border-b border-border/40 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/30"
                  >
                    {/* Avatar */}
                    <div className="size-10 shrink-0 overflow-hidden rounded-full bg-secondary">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar} alt={userName(u)} className="size-full object-cover" />
                      ) : (
                        <span className="flex size-full items-center justify-center text-[14px] font-bold text-foreground">
                          {userName(u).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Name + Discord */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-foreground">{userName(u)}</p>
                      {discord && dName ? (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <DiscordLogo className="size-2.5" />
                          <span className="truncate">{dName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-destructive/70">
                          <AlertTriangle className="size-2.5" />
                          <span>No Discord</span>
                        </div>
                      )}
                    </div>

                    {/* Canjes count */}
                    <span className="w-20 shrink-0 text-right text-[13px] tabular-nums text-muted-foreground">
                      {u.total_canjes ?? 0}
                      {(u.canjes_pendientes ?? 0) > 0 && (
                        <span className="ml-1 text-gold-bright">({u.canjes_pendientes})</span>
                      )}
                    </span>

                    {/* Points */}
                    <span className="w-28 shrink-0 text-right text-[13px] tabular-nums text-gold-bright">
                      {u.puntos.toLocaleString()}
                    </span>

                    {/* Joined */}
                    <span className="w-28 shrink-0 text-right text-[12px] text-muted-foreground">
                      {relativeTime(u.creado)}
                    </span>

                    {/* Badges */}
                    <div className="flex w-20 shrink-0 items-center justify-end gap-1">
                      {vip && <Crown className="size-3.5 text-gold-bright" aria-hidden="true" />}
                      {sub && <Star className="size-3.5 text-foreground" aria-hidden="true" />}
                      {admin && (
                        <span className="rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-gold-foreground">
                          ADM
                        </span>
                      )}
                    </div>

                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span>
                    {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
                    className="h-7 rounded-sm border border-border bg-background px-2 text-[12px] text-foreground focus:border-gold focus:outline-none"
                    aria-label="Page size"
                  >
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}/page</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                    disabled={safePage === 1}
                    className="flex size-7 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <span className="px-2 text-[12px] tabular-nums text-foreground">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                    disabled={safePage === totalPages}
                    className="flex size-7 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border p-8">
            <p className="text-[13px] text-muted-foreground">
              {search.trim() ? `No users match "${search.trim()}".` : "No users yet."}
            </p>
          </div>
        )}
      </div>

      {/* ─── Detail drawer (outside the shifting div) ─── */}
      {drawerIndex !== null && drawerIndex >= 0 && drawerIndex < filtered.length && (
        <UserDetailDrawer
          usuarios={filtered}
          index={drawerIndex}
          onClose={() => setDrawerIndex(null)}
          onNavigate={(nextIndex) => setDrawerIndex(nextIndex)}
          canjesByUser={canjesByUser}
          onManage={(id) => router.push(`/shop/admin/usuarios/${id}`)}
        />
      )}
    </>
  )
}

// ─── Detail drawer ───

function UserDetailDrawer({
  usuarios,
  index,
  onClose,
  onNavigate,
  canjesByUser,
  onManage,
}: {
  usuarios: AdminUsuario[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
  canjesByUser?: Record<number, Canje[]>
  onManage: (id: number) => void
}) {
  const u = usuarios[index]
  const avatar = userAvatar(u)
  const vip = isVip(u)
  const sub = isSub(u)
  const admin = isAdmin(u)
  const discord = hasDiscord(u)
  const dName = discordName(u)
  const userCanjes = canjesByUser?.[u.id] ?? []
  const recentCanjes = userCanjes.slice(0, 5)

  // Keyboard: Escape to close, arrows to navigate
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1)
      if (e.key === "ArrowRight" && index < usuarios.length - 1) onNavigate(index + 1)
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [index, usuarios.length, onClose, onNavigate])

  const statRows = [
    { label: "Points", value: `${u.puntos.toLocaleString()} pts` },
    { label: "Total canjes", value: String(u.total_canjes ?? 0) },
    { label: "Pending canjes", value: String(u.canjes_pendientes ?? 0) },
    { label: "Discord", value: discord ? (dName ?? "Linked") : "Not linked" },
    { label: "Joined", value: formatDateLong(u.creado) },
    { label: "User type", value: u.user_type ?? "user" },
  ]

  return (
    <aside
      aria-label={userName(u)}
      className="fixed inset-y-0 left-0 right-0 z-20 flex flex-col overflow-hidden bg-background lg:left-[max(252px,calc(50vw-588px))] lg:right-auto lg:w-[292px]"
    >
      {/* Header — close + prev/next */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-4 lg:px-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => index > 0 && onNavigate(index - 1)}
            disabled={index === 0}
            aria-label="Previous user"
            className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => index < usuarios.length - 1 && onNavigate(index + 1)}
            disabled={index === usuarios.length - 1}
            aria-label="Next user"
            className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-5 lg:px-5">
        <div className="flex flex-col gap-6">
          {/* User identity */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-muted-foreground">User</span>
              <h2 className="text-[15px] font-medium text-foreground">{userName(u)}</h2>
            </div>
            {avatar && (
              <div className="overflow-hidden rounded-full bg-secondary size-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt={userName(u)} className="size-full object-cover" />
              </div>
            )}
            <p className="text-[13px] text-muted-foreground">{u.email}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {vip && (
              <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-gold-bright">
                <Crown className="size-3" />
                VIP
              </span>
            )}
            {sub && (
              <span className="flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-bold text-foreground">
                <Star className="size-3" />
                SUB
              </span>
            )}
            {admin && (
              <span className="flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-gold-foreground">
                <Shield className="size-3" />
                ADMIN
              </span>
            )}
            {discord ? (
              <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-foreground">
                <DiscordLogo className="size-3" />
                Discord
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full border border-destructive/40 px-2 py-0.5 text-[11px] font-bold text-destructive">
                <AlertTriangle className="size-3" />
                No Discord
              </span>
            )}
          </div>

          {/* Stat rows */}
          <div className="flex flex-col">
            {statRows.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  "flex items-start justify-between gap-3 py-1.5",
                  i > 0 && "border-t border-border",
                )}
              >
                <span className="shrink-0 text-[13px] text-muted-foreground">{row.label}</span>
                <span className="text-right text-[13px] text-foreground">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Recent redemptions */}
          {recentCanjes.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-muted-foreground">Recent redemptions</span>
              {recentCanjes.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-[12px]">
                  <ShoppingBag className="size-3 shrink-0 text-muted-foreground" />
                  <span className="truncate text-foreground">{c.Producto?.nombre ?? c.producto?.nombre ?? "Unknown"}</span>
                  <span className={cn(
                    "ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px]",
                    c.estado === "pendiente" && "bg-gold/20 text-gold-bright",
                    c.estado === "entregado" && "bg-secondary text-foreground",
                    c.estado === "cancelado" && "bg-destructive/10 text-destructive",
                    c.estado === "devuelto" && "bg-secondary text-muted-foreground",
                  )}>
                    {c.estado}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Manage button */}
          <button
            type="button"
            onClick={() => onManage(u.id)}
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-[14px] font-medium text-background transition-opacity hover:opacity-85"
          >
            Manage user
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Sub-components ───

function StatCard({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode
  label: string
  value: number
  valueClass?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-sm border border-border bg-secondary p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className={cn("text-[20px] font-bold tabular-nums", valueClass ?? "text-foreground")}>
        {value}
      </span>
    </div>
  )
}

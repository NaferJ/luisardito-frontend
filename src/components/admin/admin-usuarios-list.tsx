"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Crown, Star, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdminUsuario } from "@/lib/admin"

type SortKey = "nickname" | "puntos" | "creado"
type SortDir = "asc" | "desc"

const COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: "nickname", label: "Name", className: "min-w-0 flex-1" },
  { key: "puntos", label: "Points", className: "w-28 shrink-0 text-right" },
  { key: "creado", label: "Joined", className: "w-28 shrink-0 text-right" },
]

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "today"
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function userName(u: AdminUsuario): string {
  return u.kick_data?.username ?? u.nickname ?? u.nombre ?? u.email
}

function userAvatar(u: AdminUsuario): string | undefined {
  return u.kick_data?.avatar_url ?? u.kick_avatar ?? u.avatar_url ?? undefined
}

export function AdminUsuariosList({ usuarios }: { usuarios: AdminUsuario[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("puntos")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const filtered = useMemo(() => {
    let result = usuarios
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = usuarios.filter(
        (u) =>
          userName(u).toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.kick_username?.toLowerCase().includes(term) ?? false),
      )
    }
    const sorted = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "nickname":
          cmp = userName(a).localeCompare(userName(b))
          break
        case "puntos":
          cmp = a.puntos - b.puntos
          break
        case "creado":
          cmp = new Date(a.creado).getTime() - new Date(b.creado).getTime()
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [usuarios, search, sortKey, sortDir])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-medium text-foreground">Users</h1>
          <span className="text-[13px] text-muted-foreground">
            {filtered.length} of {usuarios.length}
          </span>
        </div>
        <div className="relative flex h-8 items-center">
          <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            aria-label="Search users"
            className="h-8 w-44 rounded-full border border-border bg-secondary pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:w-56 focus:border-gold focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
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
                  "text-[11px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                  col.className,
                  (col.key === "puntos" || col.key === "creado") && "text-right",
                )}
              >
                {col.label}
              </button>
            ))}
            <span className="w-20 shrink-0 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Badges
            </span>
            <span className="w-8 shrink-0" />
          </div>
          <div className="flex flex-col">
            {filtered.map((u) => {
              const avatar = userAvatar(u)
              const isVip = u.vip_info?.is_active ?? u.is_vip ?? false
              const isSub = u.subscriber_status?.is_active ?? false
              const isAdmin = [3, 4, 5].includes(u.rol_id)
              return (
                <div
                  key={u.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/shop/admin/usuarios/${u.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      router.push(`/shop/admin/usuarios/${u.id}`)
                    }
                  }}
                  className="flex cursor-pointer items-center gap-4 border-b border-border/40 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/30"
                >
                  <div className="size-10 shrink-0 overflow-hidden rounded-full bg-secondary">
                    {avatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt={userName(u)} className="size-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-foreground">{userName(u)}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="w-28 shrink-0 text-right text-[13px] tabular-nums text-gold-bright">
                    {u.puntos.toLocaleString()}
                  </span>
                  <span className="w-28 shrink-0 text-right text-[12px] text-muted-foreground">
                    {relativeTime(u.creado)}
                  </span>
                  <div className="flex w-20 shrink-0 items-center justify-end gap-1">
                    {isVip && <Crown className="size-3.5 text-gold-bright" aria-hidden="true" />}
                    {isSub && <Star className="size-3.5 text-foreground" aria-hidden="true" />}
                    {isAdmin && (
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
        </div>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border p-8">
          <p className="text-[13px] text-muted-foreground">
            {search.trim() ? `No users match "${search.trim()}".` : "No users yet."}
          </p>
        </div>
      )}
    </div>
  )
}

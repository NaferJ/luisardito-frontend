"use client"

import { useState, useTransition } from "react"
import { Crown, Star, Plus, Minus, AlertTriangle } from "lucide-react"
import { cn, formatCompactNumber } from "@/lib/utils"
import { VipBadge } from "@/components/vip-badge"
import { DiscordLogo } from "@/components/brand-icons"
import {
  updateUsuarioPuntos,
  grantVip,
  removeVip,
} from "@/app/shop/admin/usuarios/actions"
import type { AdminUsuario } from "@/lib/admin"
import type { Canje, HistorialPunto } from "@/types"

function userName(u: AdminUsuario): string {
  return u.kick_data?.username ?? u.nickname ?? u.nombre ?? u.email
}

function userAvatar(u: AdminUsuario): string | undefined {
  return u.kick_data?.avatar_url ?? u.kick_avatar ?? u.avatar_url ?? undefined
}

function formatDate(d: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d))
}

export function AdminUsuarioDetail({
  usuario,
  canjes,
  historial,
}: Readonly<{
  usuario: AdminUsuario
  canjes: Canje[]
  historial: HistorialPunto[]
}>) {
  const [pending, startTransition] = useTransition()
  const [puntos, setPuntos] = useState(0)
  const [puntosMode, setPuntosMode] = useState<"add" | "set">("add")
  const [motivo, setMotivo] = useState("")
  const [vipDays, setVipDays] = useState(30)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const isVip = Boolean(usuario.vip_status?.is_active ?? usuario.vip_info?.is_active ?? usuario.is_vip ?? false)
  const isSub = usuario.subscriber_status?.is_active ?? false
  const isAdmin = [3, 4, 5].includes(usuario.rol_id)
  const avatar = userAvatar(usuario)
  const name = userName(usuario)
  const discord = usuario.discord_info?.linked ?? usuario.discordLinked ?? false
  const dName = usuario.discord_info?.display_name ?? usuario.discord_info?.username ?? usuario.discordUsername ?? usuario.discord_username ?? undefined

  const handleUpdatePuntos = () => {
    if (puntos === 0) return
    if (!motivo.trim()) {
      setFeedback({ ok: false, msg: "Reason is required" })
      return
    }
    setFeedback(null)
    startTransition(async () => {
      const result = await updateUsuarioPuntos(String(usuario.id), puntos, puntosMode, motivo.trim())
      if (result.error) {
        setFeedback({ ok: false, msg: result.error })
      } else {
        setFeedback({ ok: true, msg: "Points updated successfully" })
        setPuntos(0)
        setMotivo("")
      }
    })
  }

  const handleGrantVip = () => {
    setFeedback(null)
    startTransition(async () => {
      const result = await grantVip(String(usuario.id), vipDays > 0 ? vipDays : undefined)
      setFeedback(result.error ? { ok: false, msg: result.error } : { ok: true, msg: "VIP granted" })
    })
  }

  const handleRemoveVip = () => {
    if (!confirm("Remove VIP from this user?")) return
    setFeedback(null)
    startTransition(async () => {
      const result = await removeVip(String(usuario.id))
      setFeedback(result.error ? { ok: false, msg: result.error } : { ok: true, msg: "VIP removed" })
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Identity card */}
      <div className="flex flex-wrap items-center gap-4 rounded-sm border border-border bg-secondary p-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="size-14 shrink-0 rounded-full object-cover ring-2 ring-border" />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-[22px] font-bold text-foreground ring-2 ring-border">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[18px] font-semibold text-foreground">{name}</span>
            {isVip && <Badge icon={<VipBadge size={12} />} label="VIP" className="bg-gold/20 text-gold-bright" />}
            {isSub && <Badge icon={<Star className="size-3" />} label="SUB" className="bg-foreground/10 text-foreground" />}
            {isAdmin && <Badge label="ADMIN" className="bg-gold text-gold-foreground" />}
          </div>
          <span className="truncate text-[13px] text-muted-foreground">{usuario.email}</span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground">ID: {usuario.id}</span>
            {discord ? (
              <span className="flex items-center gap-1 text-[12px] text-foreground">
                <DiscordLogo className="size-3" />
                {dName}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[12px] text-destructive/70">
                <AlertTriangle className="size-3" />
                No Discord
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-muted-foreground">Points</span>
            <span className="text-[16px] font-semibold text-gold-bright">{formatCompactNumber(usuario.puntos)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-muted-foreground">Joined</span>
            <span className="text-[14px] font-semibold text-foreground">
              {new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(usuario.creado))}
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={cn(
          "rounded-sm border px-4 py-2.5 text-[13px]",
          feedback.ok ? "border-foreground/20 bg-foreground/5 text-foreground" : "border-destructive/40 bg-destructive/10 text-destructive",
        )}>
          {feedback.msg}
        </div>
      )}

      {/* Admin actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Points adjustment */}
        <div className="flex flex-col gap-3 rounded-sm border border-border bg-secondary p-4">
          <span className="text-[13px] font-medium text-foreground">Adjust points</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPuntosMode("add")}
              className={cn("flex-1 rounded-sm border px-3 py-1.5 text-[12px] font-medium", puntosMode === "add" ? "border-gold bg-gold/10 text-gold-bright" : "border-border text-muted-foreground")}
            >
              Add / Subtract
            </button>
            <button
              type="button"
              onClick={() => setPuntosMode("set")}
              className={cn("flex-1 rounded-sm border px-3 py-1.5 text-[12px] font-medium", puntosMode === "set" ? "border-gold bg-gold/10 text-gold-bright" : "border-border text-muted-foreground")}
            >
              Set absolute
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPuntos(puntos - 100)} className="flex size-8 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground">
              <Minus className="size-3.5" />
            </button>
            <input
              type="number"
              value={puntos}
              onChange={(e) => setPuntos(Number(e.target.value))}
              className="h-9 flex-1 rounded-sm border border-border bg-background px-3 text-[14px] text-foreground focus:border-gold focus:outline-none"
              placeholder="0"
            />
            <button type="button" onClick={() => setPuntos(puntos + 100)} className="flex size-8 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground">
              <Plus className="size-3.5" />
            </button>
          </div>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Reason (required)"
            className="h-9 w-full rounded-sm border border-border bg-background px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
          {puntosMode === "add" && puntos !== 0 && (
            <p className="text-[12px] text-muted-foreground">
              Result: {formatCompactNumber(usuario.puntos + puntos)} pts ({puntos > 0 ? "+" : ""}{formatCompactNumber(puntos)})
            </p>
          )}
          <button
            type="button"
            onClick={handleUpdatePuntos}
            disabled={pending || puntos === 0}
            className="flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {pending ? "Updating..." : "Update points"}
          </button>
        </div>

        {/* VIP management */}
        <div className="flex flex-col gap-3 rounded-sm border border-border bg-secondary p-4">
          <span className="text-[13px] font-medium text-foreground">VIP management</span>
          <div className="flex items-center gap-2 rounded-sm bg-muted px-3 py-2">
            <Crown className={cn("size-4", isVip ? "text-gold-bright" : "text-muted-foreground")} />
            <span className="text-[13px] text-foreground">
              {isVip ? "VIP active" : "No VIP"}
            </span>
            {(usuario.vip_status ?? usuario.vip_info)?.expires_at && (
              <span className="ml-auto text-[12px] text-muted-foreground">
                {new Date((usuario.vip_status ?? usuario.vip_info)?.expires_at ?? "").toLocaleDateString()}
              </span>
            )}
            {(usuario.vip_status ?? usuario.vip_info)?.is_permanent && (
              <span className="ml-auto text-[12px] text-gold-bright">Permanent</span>
            )}
          </div>
          {!isVip && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={vipDays}
                  onChange={(e) => setVipDays(Number(e.target.value))}
                  min={0}
                  className="h-9 flex-1 rounded-sm border border-border bg-background px-3 text-[14px] text-foreground focus:border-gold focus:outline-none"
                />
                <span className="text-[12px] text-muted-foreground">days (0 = permanent)</span>
              </div>
              <button
                type="button"
                onClick={handleGrantVip}
                disabled={pending}
                className="flex h-9 items-center justify-center gap-2 rounded-full bg-gold px-4 text-[13px] font-medium text-gold-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                <Crown className="size-3.5" />
                {pending ? "Granting..." : "Grant VIP"}
              </button>
            </>
          )}
          {isVip && (
            <button
              type="button"
              onClick={handleRemoveVip}
              disabled={pending}
              className="flex h-9 items-center justify-center gap-2 rounded-full border border-destructive/40 px-4 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              {pending ? "Removing..." : "Remove VIP"}
            </button>
          )}
        </div>
      </div>

      {/* Recent redemptions */}
      {canjes.length > 0 && (
        <div className="flex flex-col gap-3 rounded-sm border border-border bg-secondary p-4">
          <span className="text-[13px] font-medium text-foreground">
            Redemptions ({canjes.length})
          </span>
          <div className="flex flex-col gap-1.5">
            {canjes.slice(0, 10).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="truncate text-foreground">{c.Producto?.nombre ?? c.producto?.nombre ?? "Unknown"}</span>
                <span className="shrink-0 text-muted-foreground">{formatDate(c.fecha)}</span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  {c.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent points history */}
      {historial.length > 0 && (
        <div className="flex flex-col gap-3 rounded-sm border border-border bg-secondary p-4">
          <span className="text-[13px] font-medium text-foreground">
            Points history ({historial.length})
          </span>
          <div className="flex flex-col gap-1.5">
            {historial.slice(0, 10).map((h) => {
              const cambio = h.cambio ?? h.puntos ?? 0
              return (
                <div key={h.id} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="truncate text-foreground">{h.concepto ?? h.motivo}</span>
                  <span className="shrink-0 text-muted-foreground">{formatDate(h.fecha)}</span>
                  <span className={cn("shrink-0 tabular-nums font-medium", cambio > 0 ? "text-foreground" : "text-destructive")}>
                    {cambio > 0 ? "+" : ""}{formatCompactNumber(cambio)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Badge({
  icon,
  label,
  className,
}: Readonly<{
  icon?: React.ReactNode
  label: string
  className: string
}>) {
  return (
    <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", className)}>
      {icon}
      {label}
    </span>
  )
}

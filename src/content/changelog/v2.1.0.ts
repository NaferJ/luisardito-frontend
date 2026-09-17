import type { ChangelogRelease } from "./types"

const release: ChangelogRelease = {
  version: "v2.1.0",
  date: "2026-09-05",
  title: { en: "Subscriber badges — show your support tenure.", es: "Insignias de suscriptor: muestra tu antigüedad." },
  changes: [
    { type: "added", text: { en: "Tiered subscriber badges now appear on the leaderboard, top earners, profile, account pill, and admin user views — one badge per month subscribed, up to 6 months.", es: "Las insignias por niveles aparecen en la clasificación, usuarios destacados, perfil, cuenta y vistas de administración: una insignia por mes suscrito, hasta 6 meses." } },
    { type: "added", text: { en: "Hover over any subscriber or VIP badge to see a tooltip describing what it means.", es: "Pasa el cursor sobre cualquier insignia de suscriptor o VIP para ver una descripción." } },
    { type: "improved", text: { en: "VIP badges now show in the account pill and sidebar when the user has VIP status.", es: "Las insignias VIP ahora aparecen en la cuenta y la barra lateral cuando el usuario tiene estado VIP." } },
    { type: "improved", text: { en: "Top earners widget no longer shows the redundant 'pts' label next to points.", es: "El widget de usuarios destacados ya no muestra la etiqueta redundante «pts» junto a los puntos." } },
  ],
}

export default release

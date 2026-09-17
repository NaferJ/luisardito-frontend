import type { ChangelogRelease } from "./types"

const release: ChangelogRelease = {
  version: "v2.0.0",
  date: "2026-08-28",
  title: { en: "Welcome to v2.0 — a complete rebuild with a full shop, admin panel, and live leaderboard.", es: "Bienvenido a la v2.0: una reconstrucción completa con tienda, panel de administración y clasificación en directo." },
  changes: [
    { type: "added", text: { en: "Full shop experience — browse products, redeem with points, and track your redemptions.", es: "Experiencia completa de tienda: explora productos, canjéalos con puntos y consulta tus canjes." } },
    { type: "added", text: { en: "Leaderboard with live rankings, stats, reset countdown, and your pinned position.", es: "Clasificación con posiciones en directo, estadísticas, cuenta atrás y tu posición fijada." } },
    { type: "added", text: { en: "Profile page showing your points, VIP status, subscriber badge, and account info.", es: "Página de perfil con tus puntos, estado VIP, insignia de suscriptor e información de cuenta." } },
    { type: "added", text: { en: "Points history page to track every points change with reasons.", es: "Página de historial de puntos para consultar cada cambio y su motivo." } },
    { type: "added", text: { en: "Bot commands page showing all available chat commands and their status.", es: "Página de comandos del bot con todos los comandos de chat disponibles y su estado." } },
    { type: "added", text: { en: "Promotions page showing active deals and discount codes.", es: "Página de promociones con ofertas activas y códigos de descuento." } },
    { type: "added", text: { en: "Admin panel for staff — manage redemptions, users, products, promotions, commands, and Kick config.", es: "Panel de administración para gestionar canjes, usuarios, productos, promociones, comandos y configuración de Kick." } },
    { type: "added", text: { en: "Changelog page so you can see what's new in each update.", es: "Página de novedades para consultar qué incluye cada actualización." } },
    { type: "improved", text: { en: "Navigation reorganized with clear sections and proper active highlighting.", es: "Navegación reorganizada con secciones claras e indicación correcta de la página activa." } },
    { type: "improved", text: { en: "Kick logo updated to the official brand logo across the site.", es: "Logotipo de Kick actualizado al oficial en todo el sitio." } },
    { type: "fixed", text: { en: "Redemptions page now loads correctly without errors.", es: "La página de canjes ahora carga correctamente y sin errores." } },
    { type: "fixed", text: { en: "User profiles and points updates now work reliably.", es: "Los perfiles y las actualizaciones de puntos ahora funcionan de forma fiable." } },
    { type: "fixed", text: { en: "Bot commands page now shows all fields correctly.", es: "La página de comandos del bot ahora muestra todos los campos correctamente." } },
  ],
}

export default release

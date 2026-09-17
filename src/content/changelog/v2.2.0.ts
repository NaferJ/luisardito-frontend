import type { ChangelogRelease } from "./types"

const release: ChangelogRelease = {
  version: "v2.2.0",
  date: "2026-09-05",
  title: { en: "A clearer history for every reward you redeem.", es: "Un historial más claro para cada recompensa que canjeas." },
  changes: [
    { type: "improved", text: { en: "My Redemptions now loads history page by page, so large redemption histories stay quick and easy to scan.", es: "Mis canjes carga ahora el historial página por página para que los historiales grandes sigan siendo rápidos y fáciles de consultar." } },
    { type: "improved", text: { en: "Status filters, date sorting, and pagination now work together through the redemption history URL.", es: "Los filtros de estado, el orden por fecha y la paginación ahora funcionan juntos mediante la URL del historial de canjes." } },
    { type: "improved", text: { en: "Redemption cards now give product, points, date, and delivery status a clearer visual hierarchy across mobile and desktop.", es: "Las tarjetas de canje ofrecen ahora una jerarquía visual más clara para producto, puntos, fecha y estado de entrega en móvil y escritorio." } },
    { type: "fixed", text: { en: "Removed an unsupported delivery-time promise from the redemption history page.", es: "Se eliminó una promesa de tiempo de entrega no respaldada de la página de historial de canjes." } },
  ],
}

export default release

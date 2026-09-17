import type { ChangelogRelease } from "./types"

const release: ChangelogRelease = {
  version: "v2.0.1",
  date: "2026-08-28",
  title: { en: "Under the hood cleanup — faster, cleaner, more accessible.", es: "Limpieza interna: más rápido, limpio y accesible." },
  changes: [
    { type: "fixed", text: { en: "Improved keyboard navigation across the admin panel — buttons and clickable rows now work with Enter and Space keys.", es: "Mejorada la navegación con teclado en el panel de administración: los botones y filas interactivas funcionan con Enter y Espacio." } },
    { type: "improved", text: { en: "Cleaner code behind the scenes — simplified complex logic in the Kick config and product detail pages for better performance.", es: "Código interno más limpio: se simplificó la lógica compleja de la configuración de Kick y el detalle de productos para mejorar el rendimiento." } },
    { type: "fixed", text: { en: "Better form labels and screen reader support in the product editor.", es: "Mejoradas las etiquetas de formulario y la compatibilidad con lectores de pantalla en el editor de productos." } },
    { type: "improved", text: { en: "Smoother sorting and filtering in the promotions and history pages.", es: "Ordenación y filtrado más fluidos en las páginas de promociones e historial." } },
  ],
}

export default release

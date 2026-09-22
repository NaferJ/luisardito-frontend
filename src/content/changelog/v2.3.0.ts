import type { ChangelogRelease } from "./types"

const release: ChangelogRelease = {
  version: "v2.3.0",
  date: "2026-09-22",
  title: { en: "A direct line to the developer and the community.", es: "Una línea directa con el desarrollador y la comunidad." },
  changes: [
    { type: "added", text: { en: "A new card in the sidebar links to the developer's X profile, so you can send suggestions and feedback about the site.", es: "Una nueva tarjeta en la barra lateral enlaza al perfil de X del desarrollador, para que puedas enviar sugerencias y comentarios sobre el sitio." } },
    { type: "added", text: { en: "Another sidebar card points to the community Discord, home of the new public Minecraft server.", es: "Otra tarjeta en la barra lateral enlaza al Discord de la comunidad, donde está el nuevo server público de Minecraft." } },
  ],
}

export default release

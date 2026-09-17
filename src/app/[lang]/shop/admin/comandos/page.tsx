import { requireAdmin } from "@/lib/auth"
import { getAllBotCommands } from "@/lib/admin"
import { AdminComandosList } from "@/components/admin/admin-comandos-list"

export const dynamic = "force-dynamic"

export default async function AdminComandosPage() {
  await requireAdmin()
  const commands = await getAllBotCommands()

  return <AdminComandosList commands={commands} />
}

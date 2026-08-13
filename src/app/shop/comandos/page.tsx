import type { Metadata } from 'next'
import { getPublicBotCommands } from '@/lib/comandos'
import { ComandosTable } from '@/components/shop/comandos-table'

export const metadata: Metadata = {
  title: 'Bot Commands — Luisardito Shop',
  description: 'Available Kick bot commands and their usage.',
}

export default async function ComandosPage() {
  const commands = await getPublicBotCommands()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Bot Commands</h1>
        <p className="text-[15px] text-muted-foreground">
          {commands.length > 0
            ? `${commands.length} available ${commands.length === 1 ? "command" : "commands"}`
            : "Available Kick bot commands and their usage."}
        </p>
      </div>

      <ComandosTable commands={commands} />
    </div>
  )
}

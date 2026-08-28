import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'

export const metadata: Metadata = {
  title: 'Luisardito Shop — Rewards',
  description:
    'Earn points by watching streams and redeem them for rewards in the Luisardito community shop.',
}

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <SiteShell>{children}</SiteShell>
}

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { SideDecor } from '@/components/side-decor'
import { UserProvider } from '@/components/user-provider'
import { I18nProvider } from '@/components/i18n/provider'
import { getCurrentUser } from '@/lib/auth'
import { dictionaries, hasLocale, locales, type Locale } from '@/lib/i18n'
import '../globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const viewport: Viewport = {
  colorScheme: 'light',
  userScalable: true,
  themeColor: [{ media: '(prefers-color-scheme: light)', color: 'white' }],
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  return {
    title: `Luisardito — ${dictionaries[locale].landing.title}`,
    description: dictionaries[locale].landing.description,
    generator: 'v0.app',
    icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
  }
}

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const user = await getCurrentUser()
  return (
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        <I18nProvider locale={lang} dictionary={dictionaries[lang]}>
          <UserProvider user={user}>
            <SideDecor side="left" />
            <SideDecor side="right" />
            {children}
          </UserProvider>
        </I18nProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

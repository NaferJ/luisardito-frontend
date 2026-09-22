import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { SideDecor } from '@/components/side-decor'
import { UserProvider } from '@/components/user-provider'
import { I18nProvider } from '@/components/i18n/provider'
import { getCurrentUser } from '@/lib/auth'
import { GA_MEASUREMENT_ID } from '@/lib/analytics'
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

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const title = `Luisardito — ${dictionaries[locale].landing.title}`
  const description = dictionaries[locale].landing.description
  return {
    metadataBase: new URL('https://luisardito.com'),
    title,
    description,
    generator: 'v0.app',
    icons: { icon: '/icon.svg' },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: 'Luisardito',
      images: [{ url: '/landing/hero.png', width: 2302, height: 1024, alt: 'Luisardito' }],
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/landing/hero.png'],
    },
  }
}

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const user = await getCurrentUser()
  return (
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)});
          `}
        </Script>
      </head>
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

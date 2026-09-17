import { cookies } from 'next/headers'
import { defaultLocale, hasLocale, localeFromAcceptLanguage, type Locale } from './locales'

export async function getRequestLocale(request?: Request): Promise<Locale> {
  const cookieLocale = (await cookies()).get('NEXT_LOCALE')?.value
  if (cookieLocale && hasLocale(cookieLocale)) return cookieLocale
  return request ? localeFromAcceptLanguage(request.headers.get('accept-language')) : defaultLocale
}

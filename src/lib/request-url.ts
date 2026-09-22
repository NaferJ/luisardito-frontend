const PUBLIC_HOST = 'luisardito.com'
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

interface RequestHostContext {
  readonly host: string
  readonly protocol: 'http' | 'https'
  readonly secure: boolean
  readonly cookieDomain?: string
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(',')[0]?.trim() || null
}

function normalizeHostname(host: string): string {
  const normalized = host.trim().toLowerCase()
  if (normalized.startsWith('[')) {
    const end = normalized.indexOf(']')
    return end === -1 ? normalized : normalized.slice(1, end)
  }
  return normalized.split(':')[0]
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false
  }
  const [a = 0, b = 0] = parts
  return a === 10 || a === 127 || a === 0 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 169 && b === 254)
}

function isLocalHostname(hostname: string): boolean {
  return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost') || isPrivateIpv4(hostname)
}

function isPublicHostname(hostname: string): boolean {
  return hostname === PUBLIC_HOST || hostname === `shop.${PUBLIC_HOST}`
}

function requestHost(headers: Headers): string {
  const candidates = [
    firstHeaderValue(headers.get('x-forwarded-host')),
    firstHeaderValue(headers.get('host')),
  ].filter((host): host is string => Boolean(host))

  const publicHost = candidates.find((host) => isPublicHostname(normalizeHostname(host)))
  if (publicHost) return publicHost

  const localHost = candidates.find((host) => {
    const hostname = normalizeHostname(host)
    return isLocalHostname(hostname) && hostname !== '0.0.0.0'
  })
  if (localHost) return localHost

  const bindHost = candidates.find((host) => normalizeHostname(host) === '0.0.0.0')
  if (bindHost && process.env.NODE_ENV !== 'production') {
    return bindHost.replace(/^0\.0\.0\.0/, 'localhost')
  }
  return process.env.NODE_ENV === 'production' ? PUBLIC_HOST : 'localhost'
}

export function getRequestHostContext(headers: Headers): RequestHostContext {
  const host = requestHost(headers)
  const hostname = normalizeHostname(host)
  const isLocal = isLocalHostname(hostname)
  const forwardedProto = firstHeaderValue(headers.get('x-forwarded-proto'))
  const protocol = isLocal ? (forwardedProto === 'https' ? 'https' : 'http') : 'https'

  return {
    host,
    protocol,
    secure: protocol === 'https',
    ...(isPublicHostname(hostname) ? { cookieDomain: `.${PUBLIC_HOST}` } : {}),
  }
}

export function publicPathUrl(request: Request, path: string): URL {
  const context = getRequestHostContext(request.headers)
  return new URL(path, `${context.protocol}://${context.host}`)
}

function expiredCookieHeader(name: string, context: RequestHostContext, includeDomain: boolean): string {
  const parts = [
    `${name}=`,
    'Path=/',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Max-Age=0',
    'HttpOnly',
    `SameSite=${context.secure ? 'None' : 'Lax'}`,
  ]
  if (context.secure) parts.push('Secure')
  if (includeDomain && context.cookieDomain) parts.push(`Domain=${context.cookieDomain}`)
  return parts.join('; ')
}

export function appendExpiredCookie(response: Response, name: string, context: RequestHostContext): void {
  response.headers.append('Set-Cookie', expiredCookieHeader(name, context, false))
  if (context.cookieDomain) {
    response.headers.append('Set-Cookie', expiredCookieHeader(name, context, true))
  }
}

export type { RequestHostContext }

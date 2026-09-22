import { apiFetch } from '@/lib/api'
import type { Producto } from '@/types'

interface CloudinaryImageInfo {
  input?: {
    width?: unknown
    height?: unknown
  }
  output?: {
    width?: unknown
    height?: unknown
  }
  input_width?: unknown
  input_height?: unknown
}

const imageDimensionRequests = new Map<string, Promise<{ width: number; height: number } | null>>()

function toPositiveDimension(value: unknown): number | null {
  const dimension = typeof value === 'string' ? Number(value) : value
  return typeof dimension === 'number' && Number.isFinite(dimension) && dimension > 0
    ? Math.round(dimension)
    : null
}

function getCloudinaryInfoUrl(src: string): string | null {
  try {
    const url = new URL(src)
    const marker = '/image/upload/'
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || !url.pathname.includes(marker)) {
      return null
    }
    url.pathname = url.pathname.replace(marker, `${marker}fl_getinfo/`)
    return url.toString()
  } catch {
    return null
  }
}

function getCloudinaryDimensions(src: string, signal: AbortSignal): Promise<{ width: number; height: number } | null> {
  const cached = imageDimensionRequests.get(src)
  if (cached) return cached

  const infoUrl = getCloudinaryInfoUrl(src)
  if (!infoUrl) return Promise.resolve(null)

  const request = fetch(infoUrl, {
    cache: 'force-cache',
    next: { revalidate: 86400 },
    signal,
  }).then(async (response) => {
    if (!response.ok) return null

    const info = await response.json() as CloudinaryImageInfo
    const width = toPositiveDimension(info.output?.width ?? info.input?.width ?? info.input_width)
    const height = toPositiveDimension(info.output?.height ?? info.input?.height ?? info.input_height)
    return width && height ? { width, height } : null
  }).catch(() => null)

  imageDimensionRequests.set(src, request)
  void request.then((dimensions) => {
    if (!dimensions) imageDimensionRequests.delete(src)
  })
  return request
}

async function withImageDimensions(product: Producto, signal: AbortSignal): Promise<Producto> {
  if (product.imagen_width != null && product.imagen_height != null && product.imagen_width > 0 && product.imagen_height > 0) {
    return product
  }

  const image = product.imagen || product.imagen_url
  const dimensions = image ? await getCloudinaryDimensions(image, signal) : null
  return dimensions
    ? { ...product, imagen_width: dimensions.width, imagen_height: dimensions.height }
    : product
}

export async function getProducts(): Promise<Producto[]> {
  try {
    const products = await apiFetch<Producto[]>('/api/productos')
    const signal = AbortSignal.timeout(2500)
    const enrichedProducts: Producto[] = []

    for (let i = 0; i < products.length; i += 6) {
      enrichedProducts.push(...await Promise.all(products.slice(i, i + 6).map((product) => withImageDimensions(product, signal))))
    }

    return enrichedProducts
  } catch {
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<Producto | null> {
  try {
    const isId = /^\d+$/.test(slug)
    const endpoint = isId ? `/api/productos/${slug}` : `/api/productos/slug/${slug}`
    const product = await apiFetch<Producto>(endpoint)
    return await withImageDimensions(product, AbortSignal.timeout(2500))
  } catch {
    return null
  }
}

"use client"

/**
 * Extract dominant colors from an image URL via canvas pixel sampling.
 *
 * - Loads the image with `crossOrigin="anonymous"` so the canvas is not tainted.
 *   If the image host does NOT send CORS headers, the canvas becomes tainted,
 *   `getImageData` throws, and we resolve to `[]` (callers fall back to a
 *   default color). This is intentional — extraction is a progressive
 *   enhancement, never a hard failure.
 * - Results are cached per-URL so re-opening the same product is instant.
 * - Downscaled to a 48x48 canvas before sampling — cheap and good enough for
 *   a handful of dominant colors fed to the dithering shader.
 * - Returns up to `MAX_COLORS` colors sorted by frequency (most dominant first).
 *   Near-gray buckets are deprioritized but still returned if the image is
 *   essentially grayscale, so the consumer always has something to choose from.
 */

const cache = new Map<string, Promise<string[]>>()

const SAMPLE_SIZE = 48
// Quantize each channel to 5 bits (32 levels) so near-identical colors collapse
// into one bucket. This is what makes "dominant" meaningful rather than counting
// noise.
const QUANT_SHIFT = 3
const MAX_COLORS = 6

interface Bucket {
  r: number
  g: number
  b: number
  count: number
}

function quantize(v: number): number {
  return v >> QUANT_SHIFT
}

function bucketKey(r: number, g: number, b: number): number {
  return (quantize(r) << 10) | (quantize(g) << 5) | quantize(b)
}

function isNearGray(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  // Saturation proxy: if max-min is small relative to luminance, it's grayish.
  const lum = (max + min) / 2
  return max - min < 18 && lum > 40 && lum < 230
}

const toHex = (v: number) => Math.round(v).toString(16).padStart(2, "0")

/**
 * Returns up to `MAX_COLORS` dominant colors as `#RRGGBB` strings, sorted by
 * frequency (most dominant first). Returns an empty array if the image cannot
 * be read (CORS, network error, decode failure) or contains no usable pixels.
 */
export function extractDominantColors(src: string): Promise<string[]> {
  const cached = cache.get(src)
  if (cached) return cached

  const promise = new Promise<string[]>((resolve) => {
    if (typeof Image === "undefined") {
      // SSR / non-browser — no canvas available.
      resolve([])
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.decoding = "async"

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = SAMPLE_SIZE
        canvas.height = SAMPLE_SIZE
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (!ctx) {
          resolve([])
          return
        }
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

        const buckets = new Map<number, Bucket>()
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3]
          if (a < 128) continue // skip transparent pixels
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const key = bucketKey(r, g, b)
          const existing = buckets.get(key)
          if (existing) {
            existing.r += r
            existing.g += g
            existing.b += b
            existing.count += 1
          } else {
            buckets.set(key, { r, g, b, count: 1 })
          }
        }

        if (buckets.size === 0) {
          resolve([])
          return
        }

        // Sort by frequency. Non-gray buckets are preferred: we sort the
        // colored buckets first, then append gray buckets, so a consumer
        // asking for the top N gets the most vivid colors when available.
        const colored: Bucket[] = []
        const gray: Bucket[] = []
        for (const bucket of buckets.values()) {
          const avgR = bucket.r / bucket.count
          const avgG = bucket.g / bucket.count
          const avgB = bucket.b / bucket.count
          if (isNearGray(avgR, avgG, avgB)) gray.push(bucket)
          else colored.push(bucket)
        }
        const byCountDesc = (a: Bucket, b: Bucket) => b.count - a.count
        colored.sort(byCountDesc)
        gray.sort(byCountDesc)
        const ranked = [...colored, ...gray]

        const colors = ranked.slice(0, MAX_COLORS).map((bucket) => {
          const r = bucket.r / bucket.count
          const g = bucket.g / bucket.count
          const b = bucket.b / bucket.count
          return `#${toHex(r)}${toHex(g)}${toHex(b)}`
        })
        resolve(colors)
      } catch {
        // Tainted canvas (no CORS) or other read failure — degrade gracefully.
        resolve([])
      }
    }

    img.onerror = () => resolve([])

    img.src = src
  })

  cache.set(src, promise)
  return promise
}

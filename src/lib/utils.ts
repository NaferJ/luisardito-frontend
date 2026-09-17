import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value)
}

export function safeImageUrl(url?: string | null): string | undefined {
  if (!url || url.startsWith("//")) return undefined
  try {
    const base = typeof window === "undefined" ? "http://localhost" : window.location.origin
    const { protocol } = new URL(url, base)
    return protocol === "http:" || protocol === "https:" ? url : undefined
  } catch {
    return undefined
  }
}

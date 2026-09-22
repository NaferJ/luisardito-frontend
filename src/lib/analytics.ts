export const GA_MEASUREMENT_ID = "G-41BXX3T8F1"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

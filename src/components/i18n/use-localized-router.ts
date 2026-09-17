"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "./provider"
import { localizeHref } from "./locale-link"

type Router = ReturnType<typeof useRouter>

export function useLocalizedRouter(): Router {
  const router = useRouter()
  const locale = useLocale()
  return useMemo(
    () => ({
      ...router,
      push: (href: string, options?: Parameters<Router["push"]>[1]) =>
        router.push(localizeHref(href, locale), options),
      replace: (href: string, options?: Parameters<Router["replace"]>[1]) =>
        router.replace(localizeHref(href, locale), options),
    }),
    [router, locale],
  )
}

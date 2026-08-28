'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { Usuario } from '@/types'

const UserContext = createContext<{
  user: Usuario | null
  updateUser: (updates: Partial<Usuario>) => void
} | null>(null)

export function UserProvider({
  user: initialUser,
  children,
}: Readonly<{
  user: Usuario | null
  children: React.ReactNode
}>) {
  const [user, setUser] = useState<Usuario | null>(initialUser)

  const updateUser = useCallback((updates: Partial<Usuario>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  const value = useMemo(() => ({ user, updateUser }), [user, updateUser])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): Usuario | null {
  const ctx = useContext(UserContext)
  return ctx?.user ?? null
}

/** Returns a function to update the current user's fields (e.g. puntos after redemption). */
export function useUpdateUser(): (updates: Partial<Usuario>) => void {
  const ctx = useContext(UserContext)
  return ctx?.updateUser ?? (() => {})
}

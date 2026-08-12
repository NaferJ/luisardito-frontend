'use client'

import { createContext, useContext } from 'react'
import type { Usuario } from '@/types'

const UserContext = createContext<Usuario | null>(null)

export function UserProvider({
  user,
  children,
}: {
  user: Usuario | null
  children: React.ReactNode
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser(): Usuario | null {
  return useContext(UserContext)
}

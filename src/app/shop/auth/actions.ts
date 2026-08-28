'use server'

import { redirect } from 'next/navigation'
import { clearAuthCookies } from '@/lib/cookies'

export async function logout(): Promise<void> {
  await clearAuthCookies()
  redirect('/shop')
}

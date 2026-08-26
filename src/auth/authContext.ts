import { createContext, useContext } from 'react'

export const AUTH_STORAGE_KEY = 'cageerp.session'

export interface AuthSession {
  username: string
  token: string
}

export interface AuthContextValue {
  session: AuthSession | null
  signIn: (username: string, password: string) => boolean
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa estar dentro de AuthProvider.')
  }

  return context
}

export function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<AuthSession>
    return parsed.token && parsed.username
      ? { token: parsed.token, username: parsed.username }
      : null
  } catch {
    return null
  }
}

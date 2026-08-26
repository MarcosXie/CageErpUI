import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AUTH_STORAGE_KEY, AuthContext, readStoredSession, type AuthSession } from './authContext'

// Credenciais de demonstracao: a checagem roda no navegador e nao protege a API.
const DEMO_USERNAME = 'CageErpAdmin'
const DEMO_PASSWORD = '1234'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession())

  const signIn = useCallback((username: string, password: string) => {
    if (username.trim() !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      return false
    }

    const nextSession: AuthSession = {
      username: DEMO_USERNAME,
      token: btoa(`${DEMO_USERNAME}:${Date.now()}`),
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
    return true
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
  }, [])

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

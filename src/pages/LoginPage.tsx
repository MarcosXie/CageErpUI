import { useState, type FormEvent } from 'react'
import { CircleAlert, LogIn } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/authContext'

export default function LoginPage() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (session) {
    return <Navigate to="/" replace />
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (signIn(username, password)) {
      navigate('/', { replace: true })
      return
    }

    setError('Usuário ou senha inválidos.')
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm border border-[#d8d0c2] bg-white px-6 py-8 shadow-[0_18px_45px_rgba(40,48,42,0.10)]">
        <div className="flex flex-col items-center text-center">
          <img src="/branding/logo-cageouts.png" alt="CageOuts" className="h-14 w-auto object-contain" />
          <h1 className="mt-5 text-2xl font-bold text-[#183c34]">CageERP</h1>
          <p className="mt-1 text-sm text-[#5e675f]">Entre para acessar os módulos.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-semibold text-[#3e4a42]">
              Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-11 border border-[#c8bda9] bg-[#fdfbf7] px-3 text-sm text-[#1d2520] outline-none focus:border-[#1f6553]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-[#3e4a42]">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 border border-[#c8bda9] bg-[#fdfbf7] px-3 text-sm text-[#1d2520] outline-none focus:border-[#1f6553]"
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 border border-[#f2b8aa] bg-[#fff1ed] px-3 py-2.5 text-sm text-[#8c2d1c]"
              role="alert"
            >
              <CircleAlert size={17} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="mt-1 flex h-11 items-center justify-center gap-2 bg-[#183c34] px-4 text-sm font-semibold text-[#f7f4ee] transition-colors hover:bg-[#122e28]"
          >
            <LogIn size={18} />
            Entrar
          </button>
        </form>
      </section>
    </main>
  )
}

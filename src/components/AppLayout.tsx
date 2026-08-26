import { useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/authContext'
import { navModules } from '../navigation'

export default function AppLayout() {
  const { session, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f2ea]">
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[#d8d0c2] bg-[#f6f2ea] px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Alternar menu de navegação"
            aria-expanded={isMenuOpen}
            className="flex h-10 w-10 items-center justify-center border border-[#c8bda9] text-[#183c34] transition-colors hover:bg-[#edf3ee] lg:hidden"
          >
            {isMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>

          <img src="/branding/logo-cageouts.png" alt="CageOuts" className="h-9 w-auto object-contain" />
          <span className="hidden border-l border-[#d8d0c2] pl-3 text-base font-semibold text-[#183c34] sm:inline">
            CageERP
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-[#5e675f] sm:inline">{session?.username}</span>
          <button
            type="button"
            onClick={signOut}
            className="flex h-10 items-center gap-2 border border-[#b9c7bd] bg-white px-3 text-sm font-semibold text-[#183c34] transition-colors hover:bg-[#edf3ee]"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } border-b border-[#d8d0c2] bg-white/60 px-4 py-5 lg:block lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r`}
        >
          <nav aria-label="Navegação principal" className="flex flex-col gap-6">
            {navModules.map((module) => (
              <div key={module.title}>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6c786f]">
                  {module.title}
                </p>
                <ul className="flex flex-col">
                  {module.items.map((item) => {
                    const Icon = item.icon

                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                              isActive
                                ? 'border-[#183c34] bg-[#edf3ee] text-[#183c34]'
                                : 'border-transparent text-[#5e675f] hover:bg-[#edf3ee]/60 hover:text-[#183c34]'
                            }`
                          }
                        >
                          <Icon size={18} />
                          {item.label}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

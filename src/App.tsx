import { BadgeCheck, Boxes, Cable, ClipboardList, ShieldCheck } from 'lucide-react'
import './App.css'

const modules = [
  {
    title: 'TOTVS Consinco Mock',
    description: 'Base visual para consultas de produtos, precos, codigos de acesso e tributacao.',
    icon: Boxes,
  },
  {
    title: 'CageOuts',
    description: 'Area reservada para funcionarios, rejeicoes de checkout e procedimentos permitidos.',
    icon: ClipboardList,
  },
  {
    title: 'API Cage ERP',
    description: 'Preparado para consumir a API recortada quando as integracoes forem adicionadas.',
    icon: Cable,
  },
]

export default function App() {
  return (
    <main className="min-h-screen bg-[#f6f2ea] text-[#1d2520]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-[#d8d0c2] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#183c34] text-[#f7d365]">
              <ShieldCheck size={24} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6c786f]">Cage ERP</p>
              <h1 className="text-xl font-bold text-[#183c34] sm:text-2xl">Painel base</h1>
            </div>
          </div>
          <span className="rounded-full border border-[#c8bda9] px-3 py-1 text-sm font-medium text-[#5d665f]">
            Front inicial
          </span>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#366257] shadow-sm ring-1 ring-[#dfd6c8]">
              <BadgeCheck size={17} />
              Base criada para CageErpApi
            </div>
            <h2 className="text-4xl font-black leading-tight text-[#11231e] sm:text-5xl lg:text-6xl">
              Interface inicial para operações TOTVS e CageOuts.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#546057]">
              Este projeto ainda nao integra com a API. Ele replica a base tecnica do FlyGates UI e deixa uma tela inicial pronta para evoluir com fluxos de produtos, rejeicoes e funcionarios.
            </p>
          </div>

          <div className="grid gap-4">
            {modules.map((module) => {
              const Icon = module.icon

              return (
                <article key={module.title} className="rounded-lg border border-[#d7ccb9] bg-white/78 p-5 shadow-[0_18px_45px_rgba(40,48,42,0.10)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e4efe8] text-[#245449]">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#183c34]">{module.title}</h3>
                      <p className="mt-1 leading-7 text-[#5e675f]">{module.description}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

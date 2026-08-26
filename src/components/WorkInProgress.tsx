import { Construction } from 'lucide-react'

interface WorkInProgressProps {
  moduleName: string
  title: string
}

export default function WorkInProgress({ moduleName, title }: WorkInProgressProps) {
  return (
    <section>
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">{moduleName}</p>
        <h1 className="mt-1 text-3xl font-bold text-[#183c34]">{title}</h1>
      </header>

      <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-[#c8bda9] bg-white/70 px-6 py-16 text-center">
        <Construction size={34} className="mb-4 text-[#a8802f]" />
        <p className="text-lg font-semibold text-[#183c34]">Em construção</p>
        <p className="mt-2 max-w-md text-sm text-[#5e675f]">
          A tela de {title} ainda está em desenvolvimento (WIP) e será liberada em uma próxima entrega.
        </p>
      </div>
    </section>
  )
}

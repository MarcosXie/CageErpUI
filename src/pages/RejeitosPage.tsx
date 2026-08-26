import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, PackageCheck, RefreshCw } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { getRejects } from '../services/rejects'
import { rejectReasonLabels, type RejectRecord } from '../types/rejects'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const weightFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

function formatWeight(value: number) {
  return `${weightFormatter.format(value)} kg`
}

export default function RejeitosPage() {
  const [rejects, setRejects] = useState<RejectRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRejects = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setRejects(await getRejects())
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar os rejeitos agora.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRejects()
  }, [loadRejects])

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Relatórios</p>
          <h1 className="mt-1 text-3xl font-bold text-[#183c34]">Rejeitos</h1>
        </div>
        <button
          type="button"
          onClick={() => void loadRejects()}
          disabled={isLoading}
          className="flex h-10 items-center gap-2 border border-[#b9c7bd] bg-white px-3 text-sm font-semibold text-[#183c34] transition-colors hover:bg-[#edf3ee] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 border border-[#f2b8aa] bg-[#fff1ed] px-4 py-3 text-sm text-[#8c2d1c]" role="alert">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden border border-[#d8d0c2] bg-white">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center text-sm font-medium text-[#5e675f]">Carregando rejeitos...</div>
        ) : rejects.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center text-[#5e675f]">
            <PackageCheck size={30} className="mb-3 text-[#849088]" />
            <p className="font-semibold text-[#183c34]">Nenhum rejeito registrado.</p>
            <p className="mt-1 text-sm">Os itens recusados no checkout aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Horário</th>
                  <th className="px-5 py-3 font-semibold">Checkout</th>
                  <th className="px-5 py-3 font-semibold">Produto</th>
                  <th className="px-5 py-3 font-semibold">Código</th>
                  <th className="px-5 py-3 text-right font-semibold">Peso esperado</th>
                  <th className="px-5 py-3 text-right font-semibold">Peso real</th>
                  <th className="px-5 py-3 font-semibold">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {rejects.map((reject) => (
                  <tr key={reject.id} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]">
                    <td className="px-5 py-4 font-medium">{formatDate(reject.createdAt)}</td>
                    <td className="px-5 py-4">{reject.checkoutId}</td>
                    <td className="px-5 py-4 font-medium text-[#183c34]">{reject.productName}</td>
                    <td className="px-5 py-4 text-[#657168]">{reject.productCode}</td>
                    <td className="px-5 py-4 text-right">{formatWeight(reject.expectedWeight)}</td>
                    <td className="px-5 py-4 text-right">{formatWeight(reject.realWeight)}</td>
                    <td className="px-5 py-4">
                      <span className="border border-[#e0d6c4] bg-[#fdfbf7] px-2 py-1 text-xs font-semibold text-[#5e675f]">
                        {rejectReasonLabels[reject.reason] ?? 'Não informado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

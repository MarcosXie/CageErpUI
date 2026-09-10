import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, Fingerprint, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { getCageIds } from '../services/cageIds'
import { getUnits } from '../services/units'
import type { CageOutIdResponseDto } from '../types/cageIds'
import type { CageOutUnitResponseDto } from '../types/units'

// Heartbeat do terminal CageOuts é enviado a cada 20s (CageOutIdHeartbeatService).
// Consideramos offline após ~2,5 ciclos sem sinal, para tolerar jitter de rede.
const ONLINE_THRESHOLD_MS = 50_000
const AUTO_REFRESH_MS = 30_000

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'medium',
})

function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false
  return Date.now() - new Date(lastSeenAt).getTime() <= ONLINE_THRESHOLD_MS
}

function formatLastSeen(lastSeenAt: string | null): string {
  return lastSeenAt ? dateFormatter.format(new Date(lastSeenAt)) : 'Nunca conectado'
}

export default function CageOutsReportPage() {
  const [cageIds, setCageIds] = useState<CageOutIdResponseDto[]>([])
  const [units, setUnits] = useState<CageOutUnitResponseDto[]>([])
  const [unitFilter, setUnitFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true)
    setError(null)
    try {
      const [ids, unitList] = await Promise.all([getCageIds(), getUnits()])
      setCageIds(ids)
      setUnits(unitList)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar os CageOuts agora.'))
    } finally {
      if (showSpinner) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    const timer = window.setInterval(() => void loadData(false), AUTO_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [loadData])

  const filteredIds = cageIds.filter((item) => !unitFilter || item.unitId === unitFilter)
  const unitName = (unitId: string) => units.find((unit) => unit.id === unitId)?.name ?? 'Unidade não encontrada'

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Relatórios</p>
          <h1 className="mt-1 text-3xl font-bold text-[#183c34]">CageOuts</h1>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#526158]">Unidade</span>
            <select
              value={unitFilter}
              onChange={(event) => setUnitFilter(event.target.value)}
              className="h-10 border border-[#b9c7bd] bg-white px-3 text-sm text-[#183c34]"
            >
              <option value="">Todas as unidades</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={isLoading}
            className="flex h-10 items-center gap-2 border border-[#b9c7bd] bg-white px-3 text-sm font-semibold text-[#183c34] transition-colors hover:bg-[#edf3ee] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 border border-[#f2b8aa] bg-[#fff1ed] px-4 py-3 text-sm text-[#8c2d1c]" role="alert">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden border border-[#d8d0c2] bg-white">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center text-sm font-medium text-[#5e675f]">Carregando CageOuts...</div>
        ) : filteredIds.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center text-[#5e675f]">
            <Fingerprint size={30} className="mb-3 text-[#849088]" />
            <p className="font-semibold text-[#183c34]">Nenhum CageOuts encontrado.</p>
            <p className="mt-1 text-sm">Cadastre um Cage ID em Cage ID para vê-lo aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Identificador</th>
                  <th className="px-5 py-3 font-semibold">Unidade</th>
                  <th className="px-5 py-3 font-semibold">Cadastro</th>
                  <th className="px-5 py-3 font-semibold">Conexão</th>
                  <th className="px-5 py-3 font-semibold">Última atividade</th>
                </tr>
              </thead>
              <tbody>
                {filteredIds.map((item) => {
                  const online = isOnline(item.lastSeenAt)
                  return (
                    <tr key={item.id} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]">
                      <td className="px-5 py-4 font-mono font-semibold text-[#183c34]">{item.identifier}</td>
                      <td className="px-5 py-4">{unitName(item.unitId)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold ${item.isActive ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#8c2d1c]'}`}>
                          {item.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold ${online ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#8c2d1c]'}`}>
                          {online ? <Wifi size={14} /> : <WifiOff size={14} />}
                          {online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#657168]">{formatLastSeen(item.lastSeenAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

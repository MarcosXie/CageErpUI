import { useCallback, useEffect, useMemo, useState } from 'react'
import { CircleAlert, Edit2, Layers3, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { createCageCluster, deleteCageCluster, getCageClusters, updateCageCluster } from '../services/cageClusters'
import { getCageIds } from '../services/cageIds'
import { getUnits } from '../services/units'
import type { CageClusterDto, CageClusterResponseDto } from '../types/cageClusters'
import type { CageOutIdResponseDto } from '../types/cageIds'
import type { CageOutUnitResponseDto } from '../types/units'

const emptyForm: CageClusterDto = {
  unitId: '',
  name: '',
  code: '',
  isActive: true,
  cageOutIds: [],
}

export default function CageClustersPage() {
  const [clusters, setClusters] = useState<CageClusterResponseDto[]>([])
  const [units, setUnits] = useState<CageOutUnitResponseDto[]>([])
  const [cageIds, setCageIds] = useState<CageOutIdResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedUnitIdFilter, setSelectedUnitIdFilter] = useState<string>('')
  const [formData, setFormData] = useState<CageClusterDto>(emptyForm)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [clusterList, unitList, cageIdList] = await Promise.all([getCageClusters(), getUnits(), getCageIds()])
      setClusters(clusterList)
      setUnits(unitList)
      setCageIds(cageIdList)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Nao foi possivel carregar os dados de clusters.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const unitNameById = useMemo(() => {
    return new Map(units.map((unit) => [unit.id, unit.name]))
  }, [units])

  const clusterNameById = useMemo(() => {
    return new Map(clusters.map((cluster) => [cluster.id, cluster.name]))
  }, [clusters])

  const filteredClusters = clusters.filter((cluster) => {
    return !selectedUnitIdFilter || cluster.unitId === selectedUnitIdFilter
  })

  const selectableCageIds = cageIds.filter((item) => item.unitId === formData.unitId)

  function openModalForCreate() {
    setEditingId(null)
    setFormData({
      ...emptyForm,
      unitId: selectedUnitIdFilter,
    })
    setIsModalOpen(true)
  }

  function openModalForEdit(cluster: CageClusterResponseDto) {
    setEditingId(cluster.id)
    setFormData({
      unitId: cluster.unitId,
      name: cluster.name,
      code: cluster.code,
      isActive: cluster.isActive,
      cageOutIds: [...cluster.cageOutIds],
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData(emptyForm)
  }

  function handleUnitChange(unitId: string) {
    setFormData((current) => ({
      ...current,
      unitId,
      cageOutIds: current.cageOutIds.filter((id) => cageIds.some((item) => item.id === id && item.unitId === unitId)),
    }))
  }

  function toggleCageId(id: string, isChecked: boolean) {
    setFormData((current) => {
      if (isChecked) {
        if (current.cageOutIds.includes(id)) return current
        return { ...current, cageOutIds: [...current.cageOutIds, id] }
      }

      return {
        ...current,
        cageOutIds: current.cageOutIds.filter((item) => item !== id),
      }
    })
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        await updateCageCluster(editingId, formData)
      } else {
        await createCageCluster(formData)
      }

      await loadData()
      closeModal()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Nao foi possivel salvar o cluster.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja realmente excluir este cluster?')) return

    setIsSubmitting(true)
    setError(null)

    try {
      await deleteCageCluster(id)
      await loadData()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Nao foi possivel excluir o cluster.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Gestao</p>
          <h1 className="mt-1 text-3xl font-bold text-[#183c34]">CageCluster</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="filterUnit" className="text-sm font-semibold text-[#183c34]">
              Filtrar por Unidade:
            </label>
            <select
              id="filterUnit"
              value={selectedUnitIdFilter}
              onChange={(event) => setSelectedUnitIdFilter(event.target.value)}
              disabled={isLoading}
              className="h-10 border border-[#b9c7bd] bg-white px-3 text-sm text-[#183c34] disabled:cursor-not-allowed disabled:bg-[#edf3ee]"
            >
              <option value="">Todas as Unidades</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={isLoading}
            className="flex h-10 items-center gap-2 border border-[#b9c7bd] bg-white px-3 text-sm font-semibold text-[#183c34] transition-colors hover:bg-[#edf3ee] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
            Atualizar
          </button>

          <button
            type="button"
            onClick={openModalForCreate}
            disabled={isLoading || isSubmitting || units.length === 0}
            className="flex h-10 items-center gap-2 border border-[#1f6553] bg-[#1f6553] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#123d33] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={17} />
            Novo Cluster
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
          <div className="flex min-h-64 items-center justify-center text-sm font-medium text-[#5e675f]">Carregando clusters...</div>
        ) : filteredClusters.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center text-[#5e675f]">
            <Layers3 size={30} className="mb-3 text-[#849088]" />
            <p className="font-semibold text-[#183c34]">Nenhum cluster cadastrado.</p>
            <p className="mt-1 text-sm">Clique em "Novo Cluster" para criar um agrupamento de Cage IDs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold">Codigo</th>
                  <th className="px-5 py-3 font-semibold">Unidade</th>
                  <th className="px-5 py-3 font-semibold">Cage IDs</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="w-32 px-5 py-3 text-right font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredClusters.map((cluster) => (
                  <tr key={cluster.id} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]">
                    <td className="px-5 py-4 font-medium">{cluster.name}</td>
                    <td className="px-5 py-4 font-mono text-[#657168]">{cluster.code}</td>
                    <td className="px-5 py-4">{unitNameById.get(cluster.unitId) ?? 'Unidade desconhecida'}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-[#183c34]">{cluster.cageOutIds.length}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${cluster.isActive ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#8c2d1c]'}`}>
                        {cluster.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openModalForEdit(cluster)}
                          disabled={isSubmitting}
                          className="text-sm font-semibold text-[#1f6553] hover:text-[#123d33] disabled:cursor-not-allowed disabled:opacity-60"
                          title="Editar"
                        >
                          <Edit2 size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(cluster.id)}
                          disabled={isSubmitting}
                          className="text-sm font-semibold text-[#c1444c] hover:text-[#8c2d1c] disabled:cursor-not-allowed disabled:opacity-60"
                          title="Excluir"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#11231e]/35 px-4 py-6" role="presentation">
          <section
            className="w-full max-w-2xl border border-[#cfc6b7] bg-[#fdfbf7] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? 'Editar cluster' : 'Novo cluster'}
          >
            <div className="flex items-center justify-between border-b border-[#d8d0c2] px-5 py-4">
              <p className="text-sm font-semibold text-[#183c34]">{editingId ? 'Editar CageCluster' : 'Novo CageCluster'}</p>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center text-[#536057] hover:bg-[#edf3ee]"
                aria-label="Fechar formulario"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="unitId" className="block text-sm font-semibold text-[#183c34]">
                    Unidade *
                  </label>
                  <select
                    id="unitId"
                    required
                    value={formData.unitId}
                    onChange={(event) => handleUnitChange(event.target.value)}
                    disabled={isSubmitting}
                    className="mt-1 w-full border border-[#d8d0c2] px-3 py-2 text-sm text-[#183c34] disabled:bg-[#edf3ee]"
                  >
                    <option value="">Selecione uma unidade</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-semibold text-[#183c34]">
                    Codigo *
                  </label>
                  <input
                    id="code"
                    type="text"
                    required
                    maxLength={50}
                    value={formData.code}
                    onChange={(event) => setFormData({ ...formData, code: event.target.value })}
                    disabled={isSubmitting}
                    className="mt-1 w-full border border-[#d8d0c2] px-3 py-2 text-sm text-[#183c34] placeholder-[#a0a89f] disabled:bg-[#edf3ee]"
                    placeholder="CLUSTER-01"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#183c34]">
                  Nome *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  maxLength={160}
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  disabled={isSubmitting}
                  className="mt-1 w-full border border-[#d8d0c2] px-3 py-2 text-sm text-[#183c34] placeholder-[#a0a89f] disabled:bg-[#edf3ee]"
                  placeholder="Cluster Frente de Loja"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#183c34]">
                  Cage IDs do cluster
                </label>

                {!formData.unitId ? (
                  <div className="border border-dashed border-[#d8d0c2] bg-white px-4 py-6 text-sm text-[#6c786f]">
                    Selecione uma unidade para listar os Cage IDs disponiveis.
                  </div>
                ) : selectableCageIds.length === 0 ? (
                  <div className="border border-dashed border-[#d8d0c2] bg-white px-4 py-6 text-sm text-[#6c786f]">
                    Nao existem Cage IDs cadastrados para esta unidade.
                  </div>
                ) : (
                  <div className="max-h-52 space-y-2 overflow-y-auto border border-[#d8d0c2] bg-white p-3">
                    {selectableCageIds.map((item) => {
                      const isChecked = formData.cageOutIds.includes(item.id)
                      const linkedClusterId = item.cageClusterId
                      const linkedToAnotherCluster = linkedClusterId !== null && linkedClusterId !== editingId

                      return (
                        <label
                          key={item.id}
                          className="flex items-center justify-between gap-3 border border-[#e8e2d7] px-3 py-2 text-sm text-[#183c34]"
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(event) => toggleCageId(item.id, event.target.checked)}
                              disabled={isSubmitting}
                              className="h-4 w-4 border border-[#d8d0c2]"
                            />
                            <span className="font-mono font-semibold">{item.identifier}</span>
                          </span>

                          {linkedToAnotherCluster ? (
                            <span className="text-xs font-semibold text-[#8c2d1c]">
                              Hoje em: {clusterNameById.get(linkedClusterId) ?? 'Outro cluster'}
                            </span>
                          ) : (
                            <span className="text-xs text-[#6c786f]">Disponivel</span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
                  disabled={isSubmitting}
                  className="h-4 w-4 border border-[#d8d0c2] disabled:opacity-60"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-[#183c34]">
                  Ativo
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 border border-[#1f6553] bg-[#1f6553] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#123d33] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 border border-[#b9c7bd] bg-white px-4 py-2 text-sm font-semibold text-[#183c34] transition-colors hover:bg-[#edf3ee] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

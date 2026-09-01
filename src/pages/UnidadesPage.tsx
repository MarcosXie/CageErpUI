import { useCallback, useEffect, useState } from 'react'
import { Building2, CircleAlert, Edit2, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { getUnits, createUnit, updateUnit, deleteUnit } from '../services/units'
import { getClients } from '../services/clients'
import type { CageOutUnitResponseDto, CageOutUnitDto } from '../types/units'
import type { CageOutClientResponseDto } from '../types/clients'

export default function UnidadesPage() {
  const [units, setUnits] = useState<CageOutUnitResponseDto[]>([])
  const [clients, setClients] = useState<CageOutClientResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedClientIdFilter, setSelectedClientIdFilter] = useState<string>('')
  const [formData, setFormData] = useState<CageOutUnitDto>({
    name: '',
    code: '',
    clientId: '',
    baseBadgeCode: '',
    isActive: true,
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [unitsData, clientsData] = await Promise.all([getUnits(), getClients()])
      setUnits(unitsData)
      setClients(clientsData)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar os dados.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  function openModalForCreate() {
    setEditingId(null)
    setFormData({ name: '', code: '', clientId: '', baseBadgeCode: '', isActive: true })
    setIsModalOpen(true)
  }

  function openModalForEdit(unit: CageOutUnitResponseDto) {
    setEditingId(unit.id)
    setFormData({
      name: unit.name,
      code: unit.code,
      clientId: unit.clientId,
      baseBadgeCode: unit.baseBadgeCode || '',
      isActive: unit.isActive,
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ name: '', code: '', clientId: '', baseBadgeCode: '', isActive: true })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        await updateUnit(editingId, formData)
      } else {
        await createUnit(formData)
      }
      await loadData()
      closeModal()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível salvar a unidade.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja realmente excluir esta unidade?')) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await deleteUnit(id)
      await loadData()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível excluir a unidade.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || 'Desconhecido'
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Gestão</p>
          <h1 className="mt-1 text-3xl font-bold text-[#183c34]">Unidades</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="filterClient" className="text-sm font-semibold text-[#183c34]">
              Filtrar por Cliente:
            </label>
            <select
              id="filterClient"
              value={selectedClientIdFilter}
              onChange={(e) => setSelectedClientIdFilter(e.target.value)}
              disabled={isLoading}
              className="h-10 border border-[#b9c7bd] bg-white px-3 text-sm text-[#183c34] disabled:bg-[#edf3ee] disabled:cursor-not-allowed"
            >
              <option value="">Todos os Clientes</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
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
            disabled={isLoading || isSubmitting || clients.length === 0}
            className="flex h-10 items-center gap-2 border border-[#1f6553] bg-[#1f6553] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#123d33] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={17} />
            Nova Unidade
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
          <div className="flex min-h-64 items-center justify-center text-sm font-medium text-[#5e675f]">Carregando unidades...</div>
        ) : units.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center text-[#5e675f]">
            <Building2 size={30} className="mb-3 text-[#849088]" />
            <p className="font-semibold text-[#183c34]">Nenhuma unidade registrada.</p>
            <p className="mt-1 text-sm">Clique em "Nova Unidade" para adicionar uma.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold">Código</th>
                  <th className="px-5 py-3 font-semibold">Cliente</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="w-32 px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {units
                  .filter((unit) => !selectedClientIdFilter || unit.clientId === selectedClientIdFilter)
                  .map((unit) => (
                  <tr key={unit.id} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]">
                    <td className="px-5 py-4 font-medium">{unit.name}</td>
                    <td className="px-5 py-4 font-mono text-[#657168]">{unit.code}</td>
                    <td className="px-5 py-4">{getClientName(unit.clientId)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${unit.isActive ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#8c2d1c]'}`}>
                        {unit.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openModalForEdit(unit)}
                          disabled={isSubmitting}
                          className="text-sm font-semibold text-[#1f6553] hover:text-[#123d33] disabled:cursor-not-allowed disabled:opacity-60"
                          title="Editar"
                        >
                          <Edit2 size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(unit.id)}
                          disabled={isSubmitting}
                          className="text-sm font-semibold text-[#c1444c] hover:text-[#8c2d1c] disabled:cursor-not-allowed disabled:opacity-60"
                          title="Deletar"
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
          <section className="w-full max-w-md border border-[#cfc6b7] bg-[#fdfbf7] shadow-2xl" role="dialog" aria-modal="true" aria-label={editingId ? 'Editar unidade' : 'Nova unidade'}>
            <div className="flex items-center justify-between border-b border-[#d8d0c2] px-5 py-4">
              <p className="text-sm font-semibold text-[#183c34]">{editingId ? 'Editar Unidade' : 'Nova Unidade'}</p>
              <button type="button" onClick={closeModal} className="flex h-9 w-9 items-center justify-center text-[#536057] hover:bg-[#edf3ee]" aria-label="Fechar formulário">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 p-5">
              <div>
                <label htmlFor="clientId" className="block text-sm font-semibold text-[#183c34]">
                  Cliente *
                </label>
                <select
                  id="clientId"
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  disabled={isSubmitting}
                  className="mt-1 w-full border border-[#d8d0c2] px-3 py-2 text-sm text-[#183c34] disabled:bg-[#edf3ee]"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#183c34]">
                  Nome *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                  className="mt-1 w-full border border-[#d8d0c2] px-3 py-2 text-sm text-[#183c34] placeholder-[#a0a89f] disabled:bg-[#edf3ee]"
                  placeholder="Nome da unidade"
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-semibold text-[#183c34]">
                  Código *
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={isSubmitting}
                  className="mt-1 w-full border border-[#d8d0c2] px-3 py-2 text-sm text-[#183c34] placeholder-[#a0a89f] disabled:bg-[#edf3ee]"
                  placeholder="UNI-001"
                />
              </div>

              <div>
                <label htmlFor="baseBadgeCode" className="block text-sm font-semibold text-[#183c34]">
                  Crachá Base (opcional)
                </label>
                <input
                  id="baseBadgeCode"
                  type="text"
                  value={formData.baseBadgeCode || ''}
                  onChange={(e) => setFormData({ ...formData, baseBadgeCode: e.target.value })}
                  disabled={isSubmitting}
                  className="mt-1 w-full border border-[#d8d0c2] px-3 py-2 text-sm text-[#183c34] placeholder-[#a0a89f] disabled:bg-[#edf3ee]"
                  placeholder="Ex: 1000"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  disabled={isSubmitting}
                  className="h-4 w-4 border border-[#d8d0c2] cursor-pointer disabled:opacity-60"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-[#183c34]">Ativa</label>
              </div>

              <div className="flex gap-2 pt-4">
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

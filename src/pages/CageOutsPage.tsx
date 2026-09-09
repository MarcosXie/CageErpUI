import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, Edit2, Fingerprint, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { createCageId, deleteCageId, getCageIds, updateCageId } from '../services/cageIds'
import { getUnits } from '../services/units'
import type { CageOutIdDto, CageOutIdResponseDto } from '../types/cageIds'
import type { CageOutUnitResponseDto } from '../types/units'

const emptyForm: CageOutIdDto = { unitId: '', identifier: '', isActive: true }

export default function CageOutsPage() {
  const [cageIds, setCageIds] = useState<CageOutIdResponseDto[]>([])
  const [units, setUnits] = useState<CageOutUnitResponseDto[]>([])
  const [unitFilter, setUnitFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CageOutIdDto>(emptyForm)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [ids, unitList] = await Promise.all([getCageIds(), getUnits()])
      setCageIds(ids)
      setUnits(unitList)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar os Cage IDs.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData(emptyForm)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (/\s/.test(formData.identifier)) {
      setError('O identificador do Cage ID não pode conter espaços.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      if (editingId) await updateCageId(editingId, formData)
      else await createCageId(formData)
      await loadData()
      closeModal()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível salvar o Cage ID.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja realmente excluir este Cage ID?')) return
    setIsSubmitting(true)
    setError(null)
    try {
      await deleteCageId(id)
      await loadData()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível excluir o Cage ID.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredIds = cageIds.filter((item) => !unitFilter || item.unitId === unitFilter)
  const unitName = (unitId: string) => units.find((unit) => unit.id === unitId)?.name ?? 'Unidade não encontrada'

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Configuração operacional</p><h1 className="mt-1 text-3xl font-bold text-[#183c34]">Cage ID</h1></div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block"><span className="mb-1 block text-xs font-semibold text-[#526158]">Unidade</span><select value={unitFilter} onChange={(event) => setUnitFilter(event.target.value)} className="h-10 border border-[#b9c7bd] bg-white px-3 text-sm text-[#183c34]"><option value="">Todas as unidades</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
          <button type="button" onClick={() => void loadData()} disabled={isLoading} className="flex h-10 items-center gap-2 border border-[#b9c7bd] bg-white px-3 text-sm font-semibold text-[#183c34] hover:bg-[#edf3ee] disabled:opacity-60"><RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} /> Atualizar</button>
          <button type="button" onClick={() => { setEditingId(null); setFormData({ ...emptyForm, unitId: unitFilter }); setIsModalOpen(true) }} disabled={isLoading || units.length === 0} className="flex h-10 items-center gap-2 border border-[#1f6553] bg-[#1f6553] px-3 text-sm font-semibold text-white hover:bg-[#123d33] disabled:opacity-60"><Plus size={17} /> Novo Cage ID</button>
        </div>
      </div>

      {error && <div className="mb-5 flex items-center gap-3 border border-[#f2b8aa] bg-[#fff1ed] px-4 py-3 text-sm text-[#8c2d1c]" role="alert"><CircleAlert size={18} /><span>{error}</span></div>}

      <div className="overflow-hidden border border-[#d8d0c2] bg-white">
        {isLoading ? <div className="flex min-h-64 items-center justify-center text-sm text-[#5e675f]">Carregando Cage IDs...</div> : filteredIds.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center text-[#5e675f]"><Fingerprint size={32} className="mb-3 text-[#849088]" /><p className="font-semibold text-[#183c34]">Nenhum Cage ID encontrado.</p><p className="mt-1 text-sm">Cadastre um identificador para vincular um terminal a uma unidade.</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-left"><thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]"><tr><th className="px-5 py-3 font-semibold">Identificador</th><th className="px-5 py-3 font-semibold">Unidade</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">Ações</th></tr></thead><tbody>{filteredIds.map((item) => <tr key={item.id} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]"><td className="px-5 py-4 font-mono font-semibold text-[#183c34]">{item.identifier}</td><td className="px-5 py-4">{unitName(item.unitId)}</td><td className="px-5 py-4"><span className={`inline-block px-2 py-1 text-xs font-semibold ${item.isActive ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#8c2d1c]'}`}>{item.isActive ? 'Ativo' : 'Inativo'}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-3"><button type="button" onClick={() => { setEditingId(item.id); setFormData({ unitId: item.unitId, identifier: item.identifier, isActive: item.isActive }); setIsModalOpen(true) }} title="Editar" className="text-[#1f6553] hover:text-[#123d33]"><Edit2 size={17} /></button><button type="button" onClick={() => void handleDelete(item.id)} title="Excluir" className="text-[#c1444c] hover:text-[#8c2d1c]"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div>
        )}
      </div>

      {isModalOpen && <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#11231e]/35 px-4 py-6" role="presentation"><section className="w-full max-w-md border border-[#cfc6b7] bg-[#fdfbf7] shadow-2xl" role="dialog" aria-modal="true" aria-label={editingId ? 'Editar Cage ID' : 'Novo Cage ID'}><div className="flex items-center justify-between border-b border-[#d8d0c2] px-5 py-4"><p className="text-sm font-semibold text-[#183c34]">{editingId ? 'Editar Cage ID' : 'Novo Cage ID'}</p><button type="button" onClick={closeModal} className="flex h-9 w-9 items-center justify-center text-[#536057] hover:bg-[#edf3ee]" aria-label="Fechar"><X size={19} /></button></div><form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 p-5"><label className="block"><span className="text-sm font-semibold text-[#183c34]">Unidade *</span><select required value={formData.unitId} onChange={(event) => setFormData({ ...formData, unitId: event.target.value })} disabled={isSubmitting} className="mt-1 h-11 w-full border border-[#d8d0c2] bg-white px-3 text-sm"><option value="">Selecione uma unidade</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><label className="block"><span className="text-sm font-semibold text-[#183c34]">Identificador *</span><input required maxLength={80} pattern="[^\\s]+" value={formData.identifier} onChange={(event) => setFormData({ ...formData, identifier: event.target.value.replace(/\s/g, '') })} disabled={isSubmitting} placeholder="CAGE-001" className="mt-1 h-11 w-full border border-[#d8d0c2] bg-white px-3 font-mono text-sm uppercase" /><span className="mt-1 block text-xs text-[#6c786f]">Deve ser único e não pode conter espaços.</span></label><label className="flex items-center gap-3 border border-[#d8d0c2] bg-white px-3 py-3"><input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })} className="h-4 w-4 accent-[#1f6553]" /><span className="text-sm font-semibold text-[#183c34]">Cage ID ativo</span></label><div className="flex justify-end gap-2 border-t border-[#e8e2d7] pt-4"><button type="button" onClick={closeModal} className="h-10 border border-[#b9c7bd] px-4 text-sm font-semibold text-[#183c34]">Cancelar</button><button type="submit" disabled={isSubmitting} className="h-10 bg-[#1f6553] px-5 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? 'Salvando...' : 'Salvar'}</button></div></form></section></div>}
    </section>
  )
}

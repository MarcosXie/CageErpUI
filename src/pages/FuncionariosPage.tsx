import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, Edit2, Plus, RefreshCw, Trash2, Users, X } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/employees'
import { getUnits } from '../services/units'
import type { AttendantProcedure, CageOutEmployeeResponseDto, CageOutEmployeeDto } from '../types/employees'
import type { CageOutUnitResponseDto } from '../types/units'
import { ATTENDANT_PROCEDURES } from '../types/employees'

export default function FuncionariosPage() {
  const [employees, setEmployees] = useState<CageOutEmployeeResponseDto[]>([])
  const [units, setUnits] = useState<CageOutUnitResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [generatedBadgeCode, setGeneratedBadgeCode] = useState<string>('')
  const [selectedUnitIdFilter, setSelectedUnitIdFilter] = useState<string>('')
  const [formData, setFormData] = useState<CageOutEmployeeDto>({
    name: '',
    badgeCode: '',
    password: '',
    fingerprintData: '',
    unitId: '',
    allowedProcedures: [],
  })
  const [selectedProcedures, setSelectedProcedures] = useState<AttendantProcedure[]>([])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [employeesData, unitsData] = await Promise.all([getEmployees(), getUnits()])
      setEmployees(employeesData)
      setUnits(unitsData)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar os dados.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  function generateBadgeCode() {
    if (editingId) {
      const employee = employees.find((e) => e.id === editingId)
      if (employee) {
        setGeneratedBadgeCode(employee.badgeCode)
        return
      }
    }

    const usedCodes = new Set(employees.map((e) => parseInt(e.badgeCode, 10)).filter((n) => !Number.isNaN(n)))
    let nextCode = 1000
    while (usedCodes.has(nextCode)) {
      nextCode++
    }

    setGeneratedBadgeCode(nextCode.toString())
    setError(null)
  }

  function openModalForCreate() {
    setEditingId(null)
    setSelectedProcedures([])
    setGeneratedBadgeCode('')
    setFormData({ name: '', badgeCode: '', password: '', fingerprintData: '', unitId: '', allowedProcedures: [] })
    setIsModalOpen(true)
    setTimeout(() => generateBadgeCode(), 100)
  }

  function openModalForEdit(employee: CageOutEmployeeResponseDto) {
    setEditingId(employee.id)
    setSelectedProcedures(employee.allowedProcedures || [])
    setGeneratedBadgeCode(employee.badgeCode)
    setFormData({
      name: employee.name,
      badgeCode: employee.badgeCode,
      password: employee.password,
      fingerprintData: employee.fingerprintData,
      unitId: employee.unitId,
      allowedProcedures: employee.allowedProcedures || [],
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setSelectedProcedures([])
    setGeneratedBadgeCode('')
    setFormData({ name: '', badgeCode: '', password: '', fingerprintData: '', unitId: '', allowedProcedures: [] })
  }

  function toggleProcedure(procedure: AttendantProcedure) {
    setSelectedProcedures((prev) => (prev.includes(procedure) ? prev.filter((p) => p !== procedure) : [...prev, procedure]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        // No UPDATE, enviar password vazio para manter a anterior
        const submitData: CageOutEmployeeDto = {
          name: formData.name,
          badgeCode: generatedBadgeCode || formData.badgeCode,
          password: '', // Vazio no UPDATE para manter a senha anterior
          fingerprintData: formData.fingerprintData,
          unitId: formData.unitId,
          allowedProcedures: selectedProcedures,
        }
        await updateEmployee(editingId, submitData)
      } else {
        // No CREATE, password é obrigatória
        const submitData: CageOutEmployeeDto = {
          name: formData.name,
          badgeCode: generatedBadgeCode,
          password: formData.password,
          fingerprintData: formData.fingerprintData,
          unitId: formData.unitId,
          allowedProcedures: selectedProcedures,
        }
        await createEmployee(submitData)
      }
      await loadData()
      closeModal()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível salvar o funcionário.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja realmente excluir este funcionário?')) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await deleteEmployee(id)
      await loadData()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível excluir o funcionário.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Gestão</p>
          <h1 className="mt-1 text-3xl font-bold text-[#183c34]">Funcionários</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="filterUnit" className="text-sm font-semibold text-[#183c34]">
              Filtrar por Unidade:
            </label>
            <select
              id="filterUnit"
              value={selectedUnitIdFilter}
              onChange={(e) => setSelectedUnitIdFilter(e.target.value)}
              disabled={isLoading}
              className="h-10 border border-[#b9c7bd] bg-white px-3 text-sm text-[#183c34] disabled:bg-[#edf3ee] disabled:cursor-not-allowed"
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
            disabled={isLoading || isSubmitting}
            className="flex h-10 items-center gap-2 border border-[#1f6553] bg-[#1f6553] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#123d33] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={17} />
            Novo Funcionário
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
          <div className="flex min-h-64 items-center justify-center text-sm font-medium text-[#5e675f]">Carregando funcionários...</div>
        ) : employees.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center text-[#5e675f]">
            <Users size={30} className="mb-3 text-[#849088]" />
            <p className="font-semibold text-[#183c34]">Nenhum funcionário registrado.</p>
            <p className="mt-1 text-sm">Clique em "Novo Funcionário" para adicionar um.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold">Crachá</th>
                  <th className="px-5 py-3 font-semibold">Unidade</th>
                  <th className="px-5 py-3 font-semibold">Procedimentos</th>
                  <th className="w-32 px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {employees
                  .filter((employee) => !selectedUnitIdFilter || employee.unitId === selectedUnitIdFilter)
                  .map((employee) => {
                    const unit = units.find((u) => u.id === employee.unitId)
                    return (
                    <tr key={employee.id} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]">
                      <td className="px-5 py-4 font-medium">{employee.name}</td>
                      <td className="px-5 py-4 font-mono text-[#657168]">{employee.badgeCode}</td>
                      <td className="px-5 py-4">{unit?.name || 'Desconhecida'}</td>
                      <td className="px-5 py-4 text-[#657168]">
                        {employee.allowedProcedures && employee.allowedProcedures.length > 0
                          ? employee.allowedProcedures
                              .map((p) => ATTENDANT_PROCEDURES.find((ap) => ap.value === p)?.label || p)
                              .join(', ')
                          : '-'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openModalForEdit(employee)}
                            disabled={isSubmitting}
                            className="text-sm font-semibold text-[#1f6553] hover:text-[#123d33] disabled:cursor-not-allowed disabled:opacity-60"
                            title="Editar"
                          >
                            <Edit2 size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(employee.id)}
                            disabled={isSubmitting}
                            className="text-sm font-semibold text-[#c1444c] hover:text-[#8c2d1c] disabled:cursor-not-allowed disabled:opacity-60"
                            title="Deletar"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#11231e]/35 px-4 py-6" role="presentation">
          <section className="w-full max-w-md border border-[#cfc6b7] bg-[#fdfbf7] shadow-2xl" role="dialog" aria-modal="true" aria-label={editingId ? 'Editar funcionário' : 'Novo funcionário'}>
            <div className="flex items-center justify-between border-b border-[#d8d0c2] px-5 py-4">
              <p className="text-sm font-semibold text-[#183c34]">{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</p>
              <button type="button" onClick={closeModal} className="flex h-9 w-9 items-center justify-center text-[#536057] hover:bg-[#edf3ee]" aria-label="Fechar formulário">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 p-5">
              <div>
                <label className="block text-sm font-semibold text-[#183c34]">Crachá</label>
                <div className="mt-1 flex items-center gap-2">
                  <input type="text" disabled value={generatedBadgeCode} className="flex-1 border border-[#d8d0c2] bg-[#edf3ee] px-3 py-2 text-sm font-mono text-[#183c34]" />
                </div>
                <p className="mt-1 text-xs text-[#657168]">Gerado automaticamente</p>
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
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#183c34]">
                  Senha {editingId ? '' : '*'}
                </label>
                <input
                  id="password"
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isSubmitting}
                  className="mt-1 w-full border border-[#d8d0c2] px-3 py-2 text-sm text-[#183c34] placeholder-[#a0a89f] disabled:bg-[#edf3ee]"
                  placeholder={editingId ? '(deixe em branco para manter a atual)' : '••••••••'}
                />
              </div>

              <div>
                <label htmlFor="unitId" className="block text-sm font-semibold text-[#183c34]">
                  Unidade *
                </label>
                <select
                  id="unitId"
                  required
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
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
                <label className="block text-sm font-semibold text-[#183c34] mb-2">Procedimentos permitidos</label>
                <div className="space-y-2">
                  {ATTENDANT_PROCEDURES.map((procedure) => (
                    <label key={procedure.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProcedures.includes(procedure.value)}
                        onChange={() => toggleProcedure(procedure.value)}
                        disabled={isSubmitting}
                        className="h-4 w-4 border border-[#d8d0c2] cursor-pointer disabled:opacity-60"
                      />
                      <span className="text-sm text-[#3e4a42]">{procedure.label}</span>
                    </label>
                  ))}
                </div>
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

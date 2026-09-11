import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, Edit2, Plus, RefreshCw, Trash2, Users, X } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { getClients, createClient, updateClient, deleteClient, uploadClientBackgroundImage, removeClientBackgroundImage } from '../services/clients'
import type { CageOutClientResponseDto, CageOutClientDto } from '../types/clients'

const MAX_BACKGROUND_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_BACKGROUND_IMAGE_TYPES = ['image/jpeg', 'image/png']

export default function ClientesPage() {
  const [clients, setClients] = useState<CageOutClientResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<CageOutClientResponseDto | null>(null)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [formData, setFormData] = useState<CageOutClientDto>({
    name: '',
    email: '',
    isActive: true,
  })

  const loadClients = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getClients()
      setClients(data)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar os clientes.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  function openModalForCreate() {
    setEditingId(null)
    setEditingClient(null)
    setFormData({ name: '', email: '', isActive: true })
    setIsModalOpen(true)
  }

  function openModalForEdit(client: CageOutClientResponseDto) {
    setEditingId(client.id)
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      isActive: client.isActive,
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setEditingClient(null)
    setFormData({ name: '', email: '', isActive: true })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        await updateClient(editingId, formData)
      } else {
        await createClient(formData)
      }
      await loadClients()
      closeModal()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível salvar o cliente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja realmente excluir este cliente?')) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await deleteClient(id)
      await loadClients()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível excluir o cliente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleBackgroundFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editingId) return

    if (!ALLOWED_BACKGROUND_IMAGE_TYPES.includes(file.type)) {
      setError('Envie uma imagem JPG ou PNG.')
      return
    }
    if (file.size > MAX_BACKGROUND_IMAGE_BYTES) {
      setError('A imagem deve ter no máximo 5MB.')
      return
    }

    setIsUploadingBackground(true)
    setError(null)
    try {
      const updated = await uploadClientBackgroundImage(editingId, file)
      setEditingClient(updated)
      setClients((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível enviar a imagem de fundo.'))
    } finally {
      setIsUploadingBackground(false)
    }
  }

  async function handleRemoveBackground() {
    if (!editingId) return

    setIsUploadingBackground(true)
    setError(null)
    try {
      const updated = await removeClientBackgroundImage(editingId)
      setEditingClient(updated)
      setClients((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível remover a imagem de fundo.'))
    } finally {
      setIsUploadingBackground(false)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Gestão</p>
          <h1 className="mt-1 text-3xl font-bold text-[#183c34]">Clientes</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadClients()}
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
            Novo Cliente
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
          <div className="flex min-h-64 items-center justify-center text-sm font-medium text-[#5e675f]">Carregando clientes...</div>
        ) : clients.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center text-[#5e675f]">
            <Users size={30} className="mb-3 text-[#849088]" />
            <p className="font-semibold text-[#183c34]">Nenhum cliente registrado.</p>
            <p className="mt-1 text-sm">Clique em "Novo Cliente" para adicionar um.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="w-32 px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]">
                    <td className="px-5 py-4 font-medium">{client.name}</td>
                    <td className="px-5 py-4">{client.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${client.isActive ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#8c2d1c]'}`}>
                        {client.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openModalForEdit(client)}
                          disabled={isSubmitting}
                          className="text-sm font-semibold text-[#1f6553] hover:text-[#123d33] disabled:cursor-not-allowed disabled:opacity-60"
                          title="Editar"
                        >
                          <Edit2 size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(client.id)}
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
          <section className="w-full max-w-md border border-[#cfc6b7] bg-[#fdfbf7] shadow-2xl" role="dialog" aria-modal="true" aria-label={editingId ? 'Editar cliente' : 'Novo cliente'}>
            <div className="flex items-center justify-between border-b border-[#d8d0c2] px-5 py-4">
              <p className="text-sm font-semibold text-[#183c34]">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</p>
              <button type="button" onClick={closeModal} className="flex h-9 w-9 items-center justify-center text-[#536057] hover:bg-[#edf3ee]" aria-label="Fechar formulário">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 p-5">
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
                  placeholder="Nome da marca/cliente"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#183c34]">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                  className="mt-1 w-full border border-[#d8d0c2] px-3 py-2 text-sm text-[#183c34] placeholder-[#a0a89f] disabled:bg-[#edf3ee]"
                  placeholder="email@example.com"
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
                <label htmlFor="isActive" className="text-sm font-semibold text-[#183c34]">Ativo</label>
              </div>

              {editingId && (
                <div>
                  <span className="block text-sm font-semibold text-[#183c34]">Imagem de fundo (tela Idle do CageOuts)</span>
                  {editingClient?.backgroundImageUrl && (
                    <img src={editingClient.backgroundImageUrl} alt="Fundo atual" className="mt-2 h-28 w-full border border-[#d8d0c2] object-cover" />
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <label className="flex-1 cursor-pointer border border-[#d8d0c2] bg-white px-3 py-2 text-center text-sm font-semibold text-[#183c34] transition-colors hover:bg-[#edf3ee]">
                      {isUploadingBackground ? 'Enviando...' : editingClient?.backgroundImageUrl ? 'Substituir imagem' : 'Enviar imagem'}
                      <input type="file" accept="image/jpeg,image/png" onChange={(e) => void handleBackgroundFileChange(e)} disabled={isUploadingBackground} className="hidden" />
                    </label>
                    {editingClient?.backgroundImageUrl && (
                      <button
                        type="button"
                        onClick={() => void handleRemoveBackground()}
                        disabled={isUploadingBackground}
                        className="border border-[#c1444c] px-3 py-2 text-sm font-semibold text-[#c1444c] transition-colors hover:bg-[#fff1ed] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <span className="mt-1 block text-xs text-[#6c786f]">JPG ou PNG, até 5MB. Substitui a logo na tela Idle do CageOuts.</span>
                </div>
              )}

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

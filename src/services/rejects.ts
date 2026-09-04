import { api } from './api'
import type { RejectRecord } from '../types/rejects'

export async function getRejects(): Promise<RejectRecord[]> {
  const response = await api.get<RejectRecord[]>('/CageOutReject')

  return [...response.data].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  )
}

/** Apaga a mídia (imagem/vídeo) do rejeito no S3 e marca como resolvido. A API recusa (400) motivo Estorno. */
export async function resolveReject(id: string): Promise<RejectRecord> {
  const response = await api.patch<RejectRecord>(`/CageOutReject/${id}/resolve`)

  return response.data
}

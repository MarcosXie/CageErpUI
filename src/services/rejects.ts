import { api } from './api'
import type { RejectRecord } from '../types/rejects'

export async function getRejects(): Promise<RejectRecord[]> {
  const response = await api.get<RejectRecord[]>('/CageOutReject')

  return [...response.data].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  )
}

import { api } from './api'
import type { CageOutIdDto, CageOutIdResponseDto } from '../types/cageIds'

const endpoint = '/CageOutId'

export async function getCageIds(): Promise<CageOutIdResponseDto[]> {
  const response = await api.get<CageOutIdResponseDto[]>(endpoint)
  return response.data
}

export async function createCageId(value: CageOutIdDto): Promise<CageOutIdResponseDto> {
  const response = await api.post<CageOutIdResponseDto>(endpoint, value)
  return response.data
}

export async function updateCageId(id: string, value: CageOutIdDto): Promise<void> {
  await api.put(`${endpoint}/${id}`, value)
}

export async function deleteCageId(id: string): Promise<void> {
  await api.delete(`${endpoint}/${id}`)
}

export async function unbindCageId(id: string): Promise<void> {
  await api.post(`${endpoint}/${id}/unbind`)
}
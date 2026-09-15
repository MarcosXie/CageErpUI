import { api } from './api'
import type { CageClusterDto, CageClusterResponseDto } from '../types/cageClusters'

const endpoint = '/CageCluster'

export async function getCageClusters(): Promise<CageClusterResponseDto[]> {
  const response = await api.get<CageClusterResponseDto[]>(endpoint)
  return response.data
}

export async function getCageClusterById(id: string): Promise<CageClusterResponseDto> {
  const response = await api.get<CageClusterResponseDto>(`${endpoint}/${id}`)
  return response.data
}

export async function createCageCluster(value: CageClusterDto): Promise<CageClusterResponseDto> {
  const response = await api.post<CageClusterResponseDto>(endpoint, value)
  return response.data
}

export async function updateCageCluster(id: string, value: CageClusterDto): Promise<void> {
  await api.put(`${endpoint}/${id}`, value)
}

export async function deleteCageCluster(id: string): Promise<void> {
  await api.delete(`${endpoint}/${id}`)
}

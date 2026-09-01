import { api } from './api'
import type { CageOutClientDto, CageOutClientResponseDto } from '../types/clients'

const endpoint = '/CageOutClient'

export async function getClients(): Promise<CageOutClientResponseDto[]> {
  const response = await api.get<CageOutClientResponseDto[]>(endpoint)
  return response.data
}

export async function getClientById(id: string): Promise<CageOutClientResponseDto> {
  const response = await api.get<CageOutClientResponseDto>(`${endpoint}/${id}`)
  return response.data
}

export async function createClient(client: CageOutClientDto): Promise<CageOutClientResponseDto> {
  const response = await api.post<CageOutClientResponseDto>(endpoint, client)
  return response.data
}

export async function updateClient(id: string, client: CageOutClientDto): Promise<void> {
  await api.put(`${endpoint}/${id}`, client)
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`${endpoint}/${id}`)
}

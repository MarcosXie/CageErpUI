import { api } from './api'
import type { CageOutUnitDto, CageOutUnitResponseDto } from '../types/units'

const endpoint = '/CageOutUnit'

export async function getUnits(): Promise<CageOutUnitResponseDto[]> {
  const response = await api.get<CageOutUnitResponseDto[]>(endpoint)
  return response.data
}

export async function getUnitById(id: string): Promise<CageOutUnitResponseDto> {
  const response = await api.get<CageOutUnitResponseDto>(`${endpoint}/${id}`)
  return response.data
}

export async function createUnit(unit: CageOutUnitDto): Promise<CageOutUnitResponseDto> {
  const response = await api.post<CageOutUnitResponseDto>(endpoint, unit)
  return response.data
}

export async function updateUnit(id: string, unit: CageOutUnitDto): Promise<void> {
  await api.put(`${endpoint}/${id}`, unit)
}

export async function deleteUnit(id: string): Promise<void> {
  await api.delete(`${endpoint}/${id}`)
}

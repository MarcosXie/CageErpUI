import { api } from './api'
import type { CageOutEmployeeDto, CageOutEmployeeResponseDto, CageOutEmployeeAuthDto } from '../types/employees'

const endpoint = '/CageOutEmployee'

export async function getEmployees(): Promise<CageOutEmployeeResponseDto[]> {
  const response = await api.get<CageOutEmployeeResponseDto[]>(endpoint)
  return response.data
}

export async function getEmployeeById(id: string): Promise<CageOutEmployeeResponseDto> {
  const response = await api.get<CageOutEmployeeResponseDto>(`${endpoint}/${id}`)
  return response.data
}

export async function createEmployee(employee: CageOutEmployeeDto): Promise<CageOutEmployeeResponseDto> {
  const response = await api.post<CageOutEmployeeResponseDto>(endpoint, employee)
  return response.data
}

export async function updateEmployee(id: string, employee: CageOutEmployeeDto): Promise<void> {
  await api.put(`${endpoint}/${id}`, employee)
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`${endpoint}/${id}`)
}

export async function authenticateEmployee(auth: CageOutEmployeeAuthDto): Promise<{ id: string; allowedProcedures: string[] }> {
  const response = await api.post(`${endpoint}/authenticate`, auth)
  return response.data
}

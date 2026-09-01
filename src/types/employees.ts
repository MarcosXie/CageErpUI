export type AttendantProcedure = 'Refund' | 'Cleaning' | 'Emptying' | 'OpenCage' | 'CloseCage'

export interface CageOutEmployee {
  id: string
  name: string
  badgeCode: string
  password: string
  fingerprintData: string
  unitId: string
  allowedProcedures: AttendantProcedure[]
  createdAt?: string
  updatedAt?: string
}

export interface CageOutEmployeeDto {
  name: string
  badgeCode: string
  password: string
  fingerprintData: string
  unitId: string
  allowedProcedures?: AttendantProcedure[]
}

export interface CageOutEmployeeResponseDto extends CageOutEmployee {
  id: string
}

export interface CageOutEmployeeAuthDto {
  badgeCode: string
}

export const ATTENDANT_PROCEDURES: Array<{ value: AttendantProcedure; label: string }> = [
  { value: 'Refund', label: 'Estorno' },
  { value: 'Cleaning', label: 'Limpeza' },
  { value: 'Emptying', label: 'Esvaziar' },
  { value: 'OpenCage', label: 'Abrir Cage' },
  { value: 'CloseCage', label: 'Fechar Cage' },
]

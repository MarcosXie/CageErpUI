export interface CageOutIdDto {
  unitId: string
  identifier: string
  isActive: boolean
}

export interface CageOutIdResponseDto extends CageOutIdDto {
  id: string
  lastSeenAt: string | null
  boundAt: string | null
  createdAt: string
  updatedAt: string
}
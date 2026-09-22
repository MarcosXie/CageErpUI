export interface CageOutIdDto {
  unitId: string
  isActive: boolean
}

export interface CageOutIdResponseDto extends CageOutIdDto {
  id: string
  identifier: string
  cageClusterId: string | null
  lastSeenAt: string | null
  boundAt: string | null
  createdAt: string
  updatedAt: string
}
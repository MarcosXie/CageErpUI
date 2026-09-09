export interface CageOutIdDto {
  unitId: string
  identifier: string
  isActive: boolean
}

export interface CageOutIdResponseDto extends CageOutIdDto {
  id: string
  createdAt: string
  updatedAt: string
}
export interface CageClusterDto {
  unitId: string
  name: string
  code: string
  isActive: boolean
  cageOutIds: string[]
}

export interface CageClusterResponseDto extends CageClusterDto {
  id: string
  createdAt: string
  updatedAt: string
}

export interface CageClusterMemberDto {
  cageOutId: string
  boxNumber: number
}

export interface CageClusterDto {
  unitId: string
  name: string
  code: string
  isActive: boolean
  cageOutIds: string[]
  members: CageClusterMemberDto[]
}

export interface CageClusterResponseDto extends CageClusterDto {
  id: string
  createdAt: string
  updatedAt: string
}

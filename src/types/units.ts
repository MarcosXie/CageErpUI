export interface CageOutUnit {
  id: string
  name: string
  code: string
  clientId: string
  baseBadgeCode?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CageOutUnitDto {
  name: string
  code: string
  clientId: string
  baseBadgeCode?: string
  isActive?: boolean
}

export interface CageOutUnitResponseDto extends CageOutUnit {
  id: string
}

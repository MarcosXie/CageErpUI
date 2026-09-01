export interface CageOutClient {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CageOutClientDto {
  name: string
  email: string
  isActive?: boolean
}

export interface CageOutClientResponseDto extends CageOutClient {
  id: string
}

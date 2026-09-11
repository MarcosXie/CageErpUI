export interface CageOutClient {
  id: string
  name: string
  email: string
  isActive: boolean
  backgroundImageKey?: string | null
  backgroundImageUrl?: string | null
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

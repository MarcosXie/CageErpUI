export interface SdkReleaseResponseDto {
  app: string
  version: string
  fileName: string
  sizeBytes: number
  sha256?: string | null
  releaseDate: string
}

export interface SdkAppResponseDto {
  app: string
  latestVersion?: string | null
  releases: SdkReleaseResponseDto[]
}

export interface SdkDownloadResponseDto {
  url: string
  fileName: string
  expiresAt: string
}

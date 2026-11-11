import { api } from './api'
import type { SdkAppResponseDto, SdkDownloadResponseDto } from '../types/sdks'

const endpoint = '/Sdk'

export async function getSdks(): Promise<SdkAppResponseDto[]> {
  const response = await api.get<SdkAppResponseDto[]>(endpoint)
  return response.data
}

export async function getSdkDownload(app: string, version: string): Promise<SdkDownloadResponseDto> {
  const response = await api.get<SdkDownloadResponseDto>(
    `${endpoint}/${encodeURIComponent(app)}/${encodeURIComponent(version)}/download`,
  )
  return response.data
}

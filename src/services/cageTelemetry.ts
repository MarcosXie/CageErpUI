import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr'
import { api } from './api'
import type { CageOutLiveSessionResponse } from '../types/cageTelemetry'

const endpoint = '/CageOutId'
const hubPath = '/hubs/cageouts/live-session'

export async function getCageOutLiveSession(cageOutId: string): Promise<CageOutLiveSessionResponse> {
  const response = await api.get<CageOutLiveSessionResponse>(`${endpoint}/${cageOutId}/live-session`)
  return response.data
}

export function createCageOutLiveSessionConnection(
  cageOutId: string,
  onSessionUpdated: (snapshot: CageOutLiveSessionResponse) => void,
): { start: () => Promise<void>; stop: () => Promise<void> } {
  const hubUrl = buildHubUrl()

  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect([0, 1000, 3000, 5000])
    .configureLogging(LogLevel.Warning)
    .build()

  connection.on('SessionUpdated', onSessionUpdated)

  return {
    start: async () => {
      await connection.start()
      await connection.invoke('SubscribeCageOut', cageOutId)
    },
    stop: async () => {
      try {
        if (connection.state === HubConnectionState.Connected) {
          await connection.invoke('UnsubscribeCageOut', cageOutId)
        }
      } finally {
        connection.off('SessionUpdated', onSessionUpdated)
        await connection.stop()
      }
    },
  }
}

function buildHubUrl(): string {
  const baseApiUrl = typeof api.defaults.baseURL === 'string' ? api.defaults.baseURL : ''
  const baseWithoutApi = baseApiUrl.replace(/\/api\/?$/i, '')
  return `${baseWithoutApi}${hubPath}`
}

import axios from 'axios'

// Agente local (FingerprintBridge) que roda na máquina onde o leitor Hamster DX está plugado.
// Diferente de services/api.ts: sempre localhost, nunca passa pelo backend CageErpApi.
const bridgeBaseUrl = import.meta.env.VITE_FINGERPRINT_BRIDGE_URL?.trim() || 'http://127.0.0.1:5588'

const bridge = axios.create({
  baseURL: bridgeBaseUrl,
  timeout: 4_000,
})

export type EnrollmentStatus = 'Idle' | 'Capturing' | 'Success' | 'Failed'

export interface EnrollmentStatusResponse {
  status: EnrollmentStatus
  template: string | null
  errorMessage: string | null
}

export async function checkFingerprintBridgeHealth(): Promise<boolean> {
  try {
    const response = await bridge.get('/health')
    return response.status === 200
  } catch {
    return false
  }
}

export async function startFingerprintEnrollment(): Promise<void> {
  await bridge.post('/enroll/start')
}

export async function getFingerprintEnrollmentStatus(): Promise<EnrollmentStatusResponse> {
  const response = await bridge.get<EnrollmentStatusResponse>('/enroll/status')
  return response.data
}

export async function cancelFingerprintEnrollment(): Promise<void> {
  await bridge.post('/enroll/cancel')
}

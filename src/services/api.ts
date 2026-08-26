import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:5000/api'
const baseURL = /^https?:\/\//i.test(configuredBaseUrl)
  ? configuredBaseUrl
  : `https://${configuredBaseUrl}`

export const api = axios.create({
  baseURL: baseURL.replace(/\/$/, ''),
  headers: {
    Accept: 'application/json',
  },
  timeout: 10_000,
})

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }

    if (error.code === 'ECONNABORTED') {
      return 'A consulta demorou mais que o esperado. Tente novamente.'
    }
  }

  return fallback
}
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
import axios from 'axios'
import { api } from './api'
import type { TransactionDetail, TransactionSummary } from '../types/transactions'

const endpoint = '/CageOutTransaction'

export async function getTransactions(): Promise<TransactionSummary[]> {
  const response = await api.get<TransactionSummary[]>(endpoint)
  return response.data
}

export async function getTransaction(id: string): Promise<TransactionDetail> {
  const response = await api.get<TransactionDetail>(`${endpoint}/${id}`)
  return response.data
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }

    if (error.code === 'ECONNABORTED') {
      return 'A consulta demorou mais que o esperado. Tente novamente.'
    }
  }

  return 'Não foi possível carregar as vendas agora.'
}
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
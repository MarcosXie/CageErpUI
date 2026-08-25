export interface TransactionItem {
  productCode: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface TransactionSummary {
  id: string
  clientTransactionId: string
  checkoutId: string
  completedAt: string
  totalAmount: number
  itemCount: number
  createdAt: string
  items: TransactionItem[]
}

export type TransactionDetail = TransactionSummary
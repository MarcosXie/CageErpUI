export interface RejectRecord {
  id: string
  productCode: string
  productName: string
  schedule: string
  checkoutId: string
  expectedWeight: number
  realWeight: number
  productImage: string
  productVideo: string
  reason: number
  createdAt: string
}

export const rejectReasonLabels: Record<number, string> = {
  1: 'Peso',
  2: 'Imagem',
  3: 'Estorno',
  4: 'Não passou no leitor',
  5: 'Não cadastrado',
}

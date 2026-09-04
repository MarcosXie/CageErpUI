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
  isResolved: boolean
  resolvedAt: string | null
  productImageUrl: string | null
  productVideoUrl: string | null
}

export const rejectReasonLabels: Record<number, string> = {
  1: 'Peso',
  2: 'Imagem',
  3: 'Estorno',
  4: 'Não passou no leitor',
  5: 'Não cadastrado',
}

/** Rejeitos de estorno nunca podem ser marcados como resolvidos (bloqueado também na API). */
export const ESTORNO_REASON = 3

export interface CageOutLiveSessionItem {
  itemId: string
  productCode: string
  productName: string
  quantity: number
  matchStatus: string
  expectedWeightKg: number | null
  realWeightKg: number | null
  unitPrice: number | null
  scannedAt: string
}

export interface CageOutLiveSessionPayload {
  isActive: boolean
  checkoutId: string | null
  currentTotalAmount: number
  scannedCount: number
  approvedCount: number
  sessionStartedAt: string | null
  lastUpdatedAt: string | null
  photoSnapshotBase64: string | null
  videoSnapshotBase64: string | null
  items: CageOutLiveSessionItem[]
}

export interface CageOutLiveSessionResponse {
  cageOutId: string
  unitId: string
  identifier: string
  isOnline: boolean
  operationalStatus: string
  currentMode: string | null
  lastSeenAt: string | null
  generatedAt: string
  session: CageOutLiveSessionPayload
}

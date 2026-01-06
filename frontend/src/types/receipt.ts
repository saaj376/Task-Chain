export interface ReceiptMetadata {
  repository?: string
  prLink?: string
  commitHash?: string
  linesAdded?: number
  linesdeleted?: number
}

export interface VerificationSignature {
  verifierName: string
  verifierAddress: string
  signature: string
  timestamp: string
}

export interface ContributionReceipt {
  receiptId: string
  taskId: string
  taskTitle: string
  taskReward: string
  claimerAddress: string
  completedAt: string // ISO Date

  // On-Chain Proof
  onChainTxHash: string
  blockNumber?: number
  networkId?: number

  // Immutability Check
  ipfsCid?: string

  // Context
  metadata: ReceiptMetadata

  // Verification (Open/Mock for now)
  verifiers: VerificationSignature[]
}

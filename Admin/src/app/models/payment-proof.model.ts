export interface PaymentProof {
  id: number;
  orderId: number;
  amount: number;
  documentPath: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProofFormData {
  orderId: number;
  amount: number;
  document?: File;
  observations?: string;
}


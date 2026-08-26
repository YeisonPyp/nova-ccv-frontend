export interface BillingAccountDocument {
  id: number;
  bucketName: string;
  objectName: string;
}

export interface BillingChargePayment {
  id: number;
  billingAccountId: number;
  userId: number;
  username: string;
  amount: number;
  paymentDate: string;
  bucketName: string;
  fileName: string;
}

export interface BillingAccount {
  id: number;
  contractId: string;
  employeeId: number;
  employeeName: string;
  employeeLastName: string;
  costCenterId: number;
  costCenterName: string;
  accountingPeriodId: string;
  accountingPeriodStart: string;
  accountingPeriodEnd: string;
  receivedAt: string;
  expiresAt: string;
  currency: string;
  exchangeRate: number;
  observations: string;
  amount: number;
  aiuAmount: number | null;
  amortizationAmount: number | null;
  paidAmount: number | null;
  ivaAmount: number | null;
  retentionAmount: number;
  retivaAmount: number | null;
  reticaAmount: number | null;
  balance: number | null;
  status: string;
  createdAt: string;
  documents: BillingAccountDocument[];
  payments: BillingChargePayment[];
}

export interface ContractCandidate {
  id: number;
  contractId: string;
  contractType: string;
  identification: string;
  areaId: number;
  areaName: string;
  status: string;
  starts: string;
  ends: string;
  costCenterId: number;
  costCenterName: string;
  basePeriodAmount: number;
  cotizationType: string;
}

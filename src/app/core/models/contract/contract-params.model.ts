export interface ContractStatus {
  id: number;
  name: string;
  description: string | null;
}

export interface EpsAffiliationType {
  id: number;
  name: string;
  description: string | null;
}

export interface EpsEntity {
  id: number;
  name: string;
  description: string | null;
}

export interface CotizationType {
  id: number;
  name: string;
  description: string | null;
}

export interface PensionType {
  id: number;
  name: string;
  description: string | null;
}

export interface CompensationEntity {
  id: number;
  name: string;
  description: string | null;
}

export interface RangeRetention {
  id: number;
  year: number;
  minUvt: number | null;
  maxUvt: number | null;
  tax: number | null;
  subtraction: number | null;
  addition: number | null;
}

export interface SalaryParameter {
  id: number;
  year: number;
  smmlv: number;
  transportAllowance: number;
  integralSalaryFactor: number;
  employeeHealthPct: number;
  employeePensionPct: number;
  employerHealthPct: number;
  employerPensionPct: number;
  arlPct: number | null;
  senaPct: number;
  icbfPct: number;
  compensationBoxPct: number;
  uvt: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
}

export interface ContractCancellationType {
  id: number;
  name: string;
  description: string | null;
}

export interface ContractAssignmentStatus {
  id: number;
  name: string;
  color: string;
}

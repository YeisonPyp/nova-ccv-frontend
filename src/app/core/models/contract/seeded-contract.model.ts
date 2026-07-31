export interface SeededContractEmployee {
  id: number;
  name: string;
  lastName: string;
}

export interface SeededContract {
  id: string;
  contractCode: string;
  internalContractCode: string;
  contractType: string;
  subject: string;
  amount: number;
  contractorId: string;
  contractorIdentificationType: string;
  contractorName: string;
  interventorId: string;
  interventorName: string;
  employee?: SeededContractEmployee;
  durationDays: number;
  startDate: string;
  endDate: string;
  seededAt: string;
  createdAt: string;
  updatedAt: string;
}

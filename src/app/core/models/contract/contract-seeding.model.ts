export interface ContractSeedingUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

export interface ContractSeeding {
  id: string;
  bucketName: string;
  xmlResultObjectName: string;
  pdfObjectName: string;
  addedContracts: number;
  updatedContracts: number;
  user?: ContractSeedingUser;
  createdAt: string;
}

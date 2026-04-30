export interface FilingDocumentType {
  id: number;
  name: string;
}

export interface FilingProcess {
  id: number;
  name: string;
}

export interface Filing {
  id: number;
  areaId: number | null;
  areaName: string | null;
  parentId: number | null;
  processName: string | null;
  origin: string | null;
  destination: string | null;
  createdAt: string;
}

export interface FilingFile {
  id: number;
  filingId: number;
  bucketName: string;
  fileName: string;
}

export interface CreateFilingDocumentTypeDto {
  name: string;
}

export interface CreateFilingProcessDto {
  name: string;
}

export interface CreateFilingDto {
  areaId?: number;
  parentId?: number;
  origin?: string;
  destination?: string;
  processName?: string;
}

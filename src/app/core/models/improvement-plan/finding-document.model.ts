export interface FindingDocumentDto {
  id: number;
  fileName?: string;
  bucketName?: string;
  description?: string;
  createdAt?: string;
}

export interface CreateFindingDocumentDto {
  findingId: number;
  file: File;
  description?: string;
}

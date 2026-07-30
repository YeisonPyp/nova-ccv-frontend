export interface EvidenceDto {
  id: number;
  action?: any;
  type: string;
  description?: string;
  url?: string;
  objectName?: string;
  bucketName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEvidenceDto {
  actionId: number;
  file: File;
  description?: string;
}

export interface UpdateEvidenceDto {
  type?: string;
  description?: string;
  url?: string;
  filePath?: string;
  bucketName?: string;
}

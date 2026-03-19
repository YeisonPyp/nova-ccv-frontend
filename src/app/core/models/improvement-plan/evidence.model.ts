export interface EvidenceDto {
  id: number;
  correctiveAction?: any;
  type: string;
  description?: string;
  url?: string;
  filePath?: string;
  bucketName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEvidenceDto {
  correctiveActionId: number;
  type: string;
  description?: string;
  url?: string;
  filePath?: string;
  bucketName?: string;
}

export interface UpdateEvidenceDto {
  type?: string;
  description?: string;
  url?: string;
  filePath?: string;
  bucketName?: string;
}

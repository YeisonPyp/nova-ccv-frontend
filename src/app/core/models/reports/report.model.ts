export interface Report {
  id: number;
  name: string;
  templateId: number;
  bucketName: string;
  fileName: string;
  variables: Record<string, unknown>;
  createdAt: string;
  description?: string;
}

export interface CreateReportFromTemplateDto {
  reportName: string;
  templateId: number;
  vars: Record<any, any>;
}

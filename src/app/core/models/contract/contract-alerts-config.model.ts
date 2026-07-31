export interface ContractAlertsConfig {
  id: string;
  daysBeforeEnd: number;
  daysAfterEnd: number;
  alertTime: string;
  timeZone: string;
  bucketName: string;
  afterEndsTemplateName: string;
  beforeEndsTemplateName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractAlertsConfigDto {
  daysBeforeEnd: number;
  daysAfterEnd: number;
  alertTime: string;
  timeZone: string;
  beforeEndsTemplateName: string;
  afterEndsTemplateName: string;
  isActive?: boolean;
}

export interface UpdateContractAlertsConfigDto {
  daysBeforeEnd?: number;
  daysAfterEnd?: number;
  alertTime?: string;
  timeZone?: string;
  beforeEndsTemplateName?: string;
  afterEndsTemplateName?: string;
  isActive?: boolean;
}

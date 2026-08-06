export interface ImprovementProcess {
  id: number;
  name: string;
  code: string;
}

export interface CreateImprovementProcessDto {
  name: string;
  code: string;
}

export interface UpdateImprovementProcessDto {
  name: string;
  code: string;
}

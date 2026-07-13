import { ReportTemplateVariable } from './report-template-variable.model';

export interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  variables?: ReportTemplateVariable[];
}

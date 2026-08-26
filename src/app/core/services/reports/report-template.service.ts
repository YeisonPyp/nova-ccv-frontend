import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import { Injectable } from '@angular/core';
import { ReportTemplate } from '../../models/reports/report-template.model';

@Injectable({
  providedIn: 'root',
})
export class ReportTemplateService extends FilterServiceSpecImpl<ReportTemplate> {
  constructor() {
    super('report-templates');
  }
}

import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import {
  CreateReportFromTemplateDto,
  Report,
} from '../../models/reports/report.model';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReportService extends FilterServiceSpecImpl<
  Report,
  CreateReportFromTemplateDto
> {
  constructor() {
    super('reports');
  }
}

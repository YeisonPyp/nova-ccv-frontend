import { ReportTemplate } from '@/app/core/models/reports/report-template.model';
import { ReportTemplateService } from '@/app/core/services/reports/report-template.service';
import { TableColumn } from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { EditIconComponent } from '@/app/shared/components/edit-icon/edit-icon.component';
import { PaginationTableComponent } from '@/app/shared/components/pagination-table/pagination-table.component';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-template-table',
  standalone: true,
  imports: [PaginationTableComponent, CommonModule, EditIconComponent],
  templateUrl: './report-template-table.component.html',
})
export class ReportTemplateTableComponent {
  service = inject(ReportTemplateService);
  private readonly router = inject(Router);

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
  ];

  onEdit(r: ReportTemplate) {
    this.router.navigate(['/reports/templates', r.id]);
  }
}

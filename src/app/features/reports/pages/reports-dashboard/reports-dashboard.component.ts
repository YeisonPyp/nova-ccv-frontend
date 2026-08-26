import { Component } from '@angular/core';
import { ReportsListComponent } from '../../components/reports-list.component';
import { CommonModule } from '@angular/common';
import { ReportTemplateTableComponent } from './report-template-table/report-template-table.component';

@Component({
  selector: 'app-report-dashboard',
  templateUrl: './reports-dashboard.component.html',
  imports: [CommonModule, ReportsListComponent, ReportTemplateTableComponent],
  standalone: true,
})
export class ReportDashboardComponent {}

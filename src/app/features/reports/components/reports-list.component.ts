import { Report } from '@/app/core/models/reports/report.model';
import { ReportService } from '@/app/core/services/reports/report.service';
import { FileItemComponent } from '@/app/shared/components/file-item/file-item.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { Component, effect, inject, input, signal } from '@angular/core';
import builder from '@rsql/builder';

@Component({
  selector: 'app-reports-list',
  templateUrl: './reports-list.component.html',
  imports: [PaginatorComponent, FileItemComponent],
  standalone: true,
})
export class ReportsListComponent {
  private readonly service = inject(ReportService);
  templateId = input.required<number | null>();

  isLoading = signal(false);
  pages = signal(0);
  page = signal(1);
  size = signal(10);
  elements = signal<Report[]>([]);

  constructor() {
    effect(() => {
      const templateId = this.templateId();
      const page = this.page();
      const size = this.size();
      this.isLoading.set(true);
      this.service
        .findAll({
          nodes: templateId
            ? [builder.eq('templateId', templateId)]
            : undefined,
          page: page - 1,
          size,
          sort: 'createdAt,desc',
        })
        .subscribe((res) => {
          this.isLoading.set(false);
          this.pages.set(res.data.totalPages);
          this.elements.set(res.data.content);
        });
    });
  }
}

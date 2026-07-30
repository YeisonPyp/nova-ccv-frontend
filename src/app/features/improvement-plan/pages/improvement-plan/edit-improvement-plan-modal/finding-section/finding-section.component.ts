import { CommonModule } from "@angular/common";
import { Component, computed, inject, input, OnInit, signal } from "@angular/core";
import { FindingService } from "@/app/core/services/improvement-plan/finding.service";
import { FindingDto } from "@/app/core/models/improvement-plan/finding.model";
import { NewFindingComponent } from "./new-finding/new-finding.component";
import { FindingItemComponent } from "./finding-item/finding-item.component";
import { PaginatorComponent } from "@/app/shared/components/paginator/paginator.component";
import { LoadingSpinnerComponent } from "@/app/shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-finding-section",
  standalone: true,
  imports: [
    CommonModule,
    NewFindingComponent,
    FindingItemComponent,
    PaginatorComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: "./finding-section.component.html",
  styleUrl: "./finding-section.component.scss",
})
export class FindingSectionComponent implements OnInit {
  planId = input.required<number>();
  service = inject(FindingService);

  isLoading = signal(false);

  findings = signal<FindingDto[]>([]);

  currentPage = signal(1);
  pageSize = signal(5);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.findings().length / this.pageSize())),
  );

  pagedFindings = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.findings().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.isLoading.set(true);
    this.service.findByPlanId(this.planId()).subscribe((r) => {
      if (r.success) this.findings.set(r.data);
      this.isLoading.set(false);
    });
  }

  onCreated(f: FindingDto) {
    this.findings.set([...this.findings(), f]);
  }

  onDeleteFinding(f: FindingDto) {
    this.findings.set(this.findings().filter((i) => i.id !== f.id));
  }

  onSelectPage(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }
}

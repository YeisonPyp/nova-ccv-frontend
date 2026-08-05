import { CommonModule } from "@angular/common";
import { Component, computed, inject, input, OnInit, signal } from "@angular/core";
import { ImprovementActionService } from "@/app/core/services/improvement-plan/improvement-action.service";
import { NewActionComponent } from "./new-action/new-action.component";
import { ImprovementActionDto } from "@/app/core/models/improvement-plan/improvement-action.model";
import { ActionDetailsComponent } from "./action-details/action-details.component";
import { PaginatorComponent } from "@/app/shared/components/paginator/paginator.component";
import { LoadingSpinnerComponent } from "@/app/shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-action-section",
  standalone: true,
  imports: [
    CommonModule,
    NewActionComponent,
    ActionDetailsComponent,
    PaginatorComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: "./action-section.component.html",
  styleUrl: "./action-section.component.scss",
})
export class ActionSectionComponent implements OnInit {
  findingId = input.required<number>();
  service = inject(ImprovementActionService);

  isLoading = signal(false);

  actions = signal<ImprovementActionDto[]>([]);

  currentPage = signal(1);
  pageSize = signal(5);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.actions().length / this.pageSize())),
  );

  pagedActions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.actions().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.isLoading.set(true);
    this.service.findByFindingId(this.findingId()).subscribe((r) => {
      if (r.success) this.actions.set(r.data);
      this.isLoading.set(false);
    });
  }

  onCreated(a: ImprovementActionDto) {
    this.actions.set([...this.actions(), a]);
  }

  onDeleteAction(a: ImprovementActionDto) {
    this.actions.set(this.actions().filter((i) => i.id !== a.id));
  }

  onActionUpdated(updated: ImprovementActionDto) {
    this.actions.set(
      this.actions().map((a) => (a.id === updated.id ? updated : a)),
    );
  }

  onSelectPage(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }
}

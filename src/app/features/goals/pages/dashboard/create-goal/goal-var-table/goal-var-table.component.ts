import {
  Component,
  computed,
  inject,
  input,
  signal,
  effect,
  OnInit,
  output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { GoalService } from "@/app/core/services/goals/goal.service";
import { GoalVar } from "@/app/core/models/goals/goal-var.model";
import { PaginatorComponent } from "@/app/shared/components/paginator/paginator.component";
import { APIPage } from "@/app/core/models/api-page.model";
import { GoalOption } from "@/app/core/models/goals/goal-option.model";

@Component({
  selector: "app-goal-var-table",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginatorComponent],
  templateUrl: "./goal-var-table.component.html",
  styleUrl: "./goal-var-table.component.scss",
})
export class GoalVarTableComponent {
  goalVar = input.required<GoalVar>();

  onSelectOption = output<GoalOption>();

  goalService = inject(GoalService);

  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  options = signal<APIPage<GoalOption> | undefined>(undefined);

  columns: TableColumn<GoalOption>[] = [{ key: "label", label: "Opción" }];

  totalPages = computed(() => Math.max(1, this.options()?.totalPages || 1));
  data = computed(() => this.options()?.content || []);

  constructor() {
    effect(() => {
      this.fetchOptions(this.currentPage(), this.pageSize());
    });
  }

  fetchOptions(page: number, size: number) {
    this.goalService
      .findOptionsForTemplateVar(this.goalVar().id, page - 1, size)
      .subscribe((res) => {
        if (res.success && res.data) {
          this.options.set(res.data);
        }
      });
  }

  onPageChange(p: number) {
    this.currentPage.set(p);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  $onSelectOption(option: GoalOption) {
    this.onSelectOption.emit(option);
  }
}

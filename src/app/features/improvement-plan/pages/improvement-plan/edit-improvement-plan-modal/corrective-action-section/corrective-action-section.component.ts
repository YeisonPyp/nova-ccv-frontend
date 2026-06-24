import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  Input,
  input,
  OnInit,
  signal,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { combineLatest, finalize, map, of, switchMap } from "rxjs";
import { CorrectiveActionService } from "@/app/core/services/improvement-plan/corrective-action.service";
import { NewCorrectiveActionComponent } from "./new-corrective-action/new-corrective-action.component";
import { CorrectiveActionDto } from "@/app/core/models/improvement-plan/corrective-action.model";
import { CorrectiveActionDetailsComponent } from "./corrective-action-details/corrective-action-details.component";
import { PaginatorComponent } from "@/app/shared/components/paginator/paginator.component";
import { LoadingSpinnerComponent } from "@/app/shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-corrective-action-section",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NewCorrectiveActionComponent,
    CorrectiveActionDetailsComponent,
    PaginatorComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: "./corrective-action-section.component.html",
  styleUrl: "./corrective-action-section.component.scss",
})
export class CorrectiveActionSectionComponent implements OnInit {
  parentId = input<number>();
  planId = input.required<number>();
  childActions = input(1);
  service = inject(CorrectiveActionService);

  isLoading = signal(false);

  actions = signal<CorrectiveActionDto[]>([]);

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
    this.service.findByParentId(this.planId()).subscribe((e) => {
      if (e) this.actions.set(e.data);
      this.isLoading.set(false);
    });
  }

  onCreated(c: CorrectiveActionDto) {
    this.actions.set([...this.actions(), c]);
  }

  onDeleteCorrectiveAction(a: CorrectiveActionDto) {
    this.actions.set([...this.actions().filter((i) => i.id !== a.id)]);
  }

  onSelectPage(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }
}

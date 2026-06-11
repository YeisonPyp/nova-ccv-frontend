import {
  Component,
  computed,
  inject,
  input,
  output,
  effect,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CurrencyFormatDirective } from "@/app/shared/directives/currency-format.directive";
import {
  PatActivityPlan,
  PatActivityPlanService,
  CreatePatActivityPlanDto,
} from "@/app/core/services/pat/pat-activity-plan.service";
import { debounceTime, distinctUntilChanged, filter } from "rxjs";

export interface MonthCardModalData {
  month: number;
  label: string;
  plan: PatActivityPlan | null;
}

@Component({
  selector: "app-activity-plan-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyFormatDirective],
  templateUrl: "./activity-plan-modal.component.html",
})
export class ActivityPlanModalComponent {
  activityId = input.required<number>();
  card = input.required<MonthCardModalData>();
  isOpen = input<boolean>(false);

  onClose = output<void>();
  onSave = output<PatActivityPlan>();

  private readonly fb = inject(FormBuilder);
  private readonly baseService = inject(PatActivityPlanService);

  submitting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    plannedBudget: [0, [Validators.required, Validators.min(0)]],
    plannedBenefit: [0, [Validators.required, Validators.min(0)]],
    plannedMeasurementGoal: [0, [Validators.required, Validators.min(0)]],
    plannedIndicatorGoal: [0, [Validators.required, Validators.min(0)]],
  });

  readonly modalTitle = computed(() => {
    const c = this.card();
    return c ? `${c.plan ? "Editar" : "Registrar"} plan — ${c.label}` : "";
  });

  constructor() {
    effect(() => {
      const c = this.card();
      if (this.isOpen() && c) {
        this.error.set(null);
        if (c.plan) {
          this.form.reset({
            plannedBudget: c.plan.plannedBudget,
            plannedBenefit: c.plan.plannedBenefit,
            plannedMeasurementGoal: c.plan.plannedMeasurementGoal,
            plannedIndicatorGoal: c.plan.plannedIndicatorGoal,
          });
        } else {
          this.form.reset({
            plannedBudget: 0,
            plannedBenefit: 0,
            plannedMeasurementGoal: 0,
            plannedIndicatorGoal: 0,
          });
        }
      }

      this.form.valueChanges
        .pipe(
          distinctUntilChanged(),
          debounceTime(300),
          filter(() => this.form.valid),
        )
        .subscribe((value) => {
          const dto: CreatePatActivityPlanDto = {
            activityId: this.activityId(),
            month: c.month,
            plannedBudget: value.plannedBudget!,
            plannedBenefit: value.plannedBenefit!,
            plannedMeasurementGoal: value.plannedMeasurementGoal!,
            plannedIndicatorGoal: value.plannedIndicatorGoal!,
          };

          const req$ = c.plan
            ? this.baseService.update(c.plan.id, dto)
            : this.baseService.create(dto);

          req$.subscribe({
            next: (res) => {
              this.submitting.set(false);
              if (res.success && res.data) {
                this.onSave.emit(res.data);
                this.closeModal();
              }
            },
          });
        });
    });
  }

  closeModal() {
    this.onClose.emit();
  }
}

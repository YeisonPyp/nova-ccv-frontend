import {
  ActivityBudgetExecution,
  BudgetCategory,
  PatActivityBudgetMatrix,
  PatActivityConsolidation,
  PatActivityExecution,
} from "@/app/core/models/pat/pat-models";
import { PatActivityExecutionService } from "@/app/core/services/pat/pat-activity-execution.service";
import { CommonModule } from "@angular/common";
import {
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
  output,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { debounceTime, distinctUntilChanged, filter } from "rxjs";
import { BudgetExecutionComponent } from "./bugdet-execution/budget-execution.component";
import { ProductExecutionComponent } from "./product-execution/product-execution.component";
import {
  ActivityProductExecution,
  ActivityProductMatrixRow,
} from "@/app/core/services/pat/pat-activity-execution.service";
import { PatActivityPlan } from "@/app/core/services/pat/pat-activity-plan.service";

@Component({
  selector: "app-activity-modal-component",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BudgetExecutionComponent,
    ProductExecutionComponent,
  ],
  templateUrl: "./activity-execution-modal.component.html",
})
export class ActivityExecutionModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PatActivityExecutionService);

  consolidation = input.required<PatActivityConsolidation>();
  month = input.required<number>();
  activityId = input.required<number>();
  budgetMatrix = input.required<PatActivityBudgetMatrix[]>();
  isOpen = input.required<boolean>();
  plan = input.required<PatActivityPlan | null>();

  execution = input.required<PatActivityExecution | null>();

  onSave = output<PatActivityExecution>();
  onClose = output<void>();

  /** Products of the activity's project + executed contribution for the month. */
  products = signal<ActivityProductMatrixRow[]>([]);

  form = this.fb.group({
    executedBenefit: [0, [Validators.required, Validators.min(0)]],
    executedMeasurementGoal: [0, [Validators.required, Validators.min(0)]],
    executedIndicatorGoal: [0, [Validators.required, Validators.min(0)]],
    description: [""],
  });

  constructor() {
    effect(() => {
      const consolidation = this.consolidation();

      const executedBenefitControl = this.form.get("executedBenefit");
      const executedMeasurementControl = this.form.get(
        "executedMeasurementGoal",
      );
      const executedIndicatorControl = this.form.get("executedIndicatorGoal");

      if (executedBenefitControl) {
        executedBenefitControl.clearValidators();
        executedBenefitControl.addValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(
            consolidation.plannedBenefit - consolidation.executedBenefitGoal,
          ),
        ]);

        executedBenefitControl.updateValueAndValidity({ emitEvent: false });
      }

      if (executedMeasurementControl) {
        executedMeasurementControl.clearValidators();
        executedMeasurementControl.addValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(
            consolidation.plannedMeasurement -
              consolidation.executedMeasurementGoal,
          ),
        ]);

        executedMeasurementControl.updateValueAndValidity({ emitEvent: false });
      }

      if (executedIndicatorControl) {
        executedIndicatorControl.clearValidators();
        executedIndicatorControl.addValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(
            consolidation.plannedIndicator -
              consolidation.executedIndicatorGoal,
          ),
        ]);

        executedIndicatorControl.updateValueAndValidity({ emitEvent: false });
      }

      const execution = this.execution();

      if (execution) {
        console.log(execution);
        this.form.patchValue(
          {
            executedBenefit: execution.executedBenefit,
            executedMeasurementGoal: execution.executedMeasurementGoal,
            executedIndicatorGoal: execution.executedIndicatorGoal,
            description: execution.description,
          },
          { emitEvent: false },
        );
      }
    });
  }

  private loadProducts() {
    this.service
      .productMatrix(this.activityId(), this.month())
      .subscribe((res) => this.products.set(res.data ?? []));
  }

  onSaveProductExecution(exec: ActivityProductExecution) {
    this.products.update((rows) =>
      rows.map((r) =>
        r.productId === exec.productId
          ? { ...r, executionId: exec.id, contribution: exec.contribution }
          : r,
      ),
    );
  }

  ngOnInit(): void {
    this.loadProducts();

    this.form.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(700),
        filter(() => this.form.valid),
      )
      .subscribe((value) => {
        this.service
          .create({
            activityId: this.activityId(),
            month: this.month(),
            executedBenefit: value.executedBenefit || 0,
            executedMeasurement: value.executedMeasurementGoal || 0,
            executedIndicator: value.executedIndicatorGoal || 0,
            description: value.description || undefined,
          })
          .subscribe((res) => {
            this.onSave.emit(res.data);
          });
      });
  }

  getBudgetExecutionByBudgetCategory(c: BudgetCategory) {
    return this.execution()?.budgetExecutions?.find(
      (e) => e.budgetCategory?.id === c.id,
    );
  }

  onSaveBudgetExecution(budgetExecution: ActivityBudgetExecution) {
    const e = this.execution();
    if (e) {
      const budgetEx = e.budgetExecutions ?? [];
      const budgetExMap = budgetEx.reduce(
        (acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        },
        {} as Record<number, ActivityBudgetExecution>,
      );
      budgetExMap[budgetExecution.id] = budgetExecution;
      e.budgetExecutions = Object.values(budgetExMap);
      e.executedBudget = e.budgetExecutions.reduce(
        (acc, curr) => acc + curr.amount,
        0,
      );
      this.onSave.emit(e);
    } else {
      this.onSave.emit({
        activityId: this.activityId(),
        createdAt: "",
        description: "",
        executedBenefit: 0,
        executedBudget: budgetExecution.amount,
        executedIndicatorGoal: 0,
        executedMeasurementGoal: 0,
        id: budgetExecution.executionId,
        month: this.month(),
        budgetExecutions: [budgetExecution],
      });
    }
  }
}

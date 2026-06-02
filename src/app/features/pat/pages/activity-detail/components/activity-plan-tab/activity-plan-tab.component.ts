import { Component, inject, input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import {
  PatActivityPlanService,
  CreatePatActivityPlanDto,
  PatActivityPlanServiceByActivityId,
} from "@/app/core/services/pat/pat-activity-plan.service";
import { CurrencyFormatDirective } from "@/app/shared/directives/currency-format.directive";

@Component({
  selector: "app-activity-plan-tab",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaginationTableComponent,
    CurrencyFormatDirective,
  ],
  templateUrl: "./activity-plan-tab.component.html",
})
export class ActivityPlanTabComponent implements OnInit {
  activityId = input.required<number>();

  baseService = inject(PatActivityPlanService);
  service!: PatActivityPlanServiceByActivityId;

  private fb = inject(FormBuilder);

  submitting = false;

  form = this.fb.group({
    month: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(12)],
    ],
    plannedBudget: [0, [Validators.required, Validators.min(0)]],
    plannedBenefit: [0, [Validators.required, Validators.min(0)]],
    plannedMeasurementGoal: [0, [Validators.required, Validators.min(0)]],
    plannedIndicatorGoal: [0, [Validators.required, Validators.min(0)]],
  });

  columns: TableColumn[] = [
    { key: "month", label: "Mes" },
    { key: "plannedBudget", label: "Presupuesto" },
    { key: "plannedBenefit", label: "Beneficio" },
    { key: "plannedMeasurementGoal", label: "Meta Medición" },
    { key: "plannedIndicatorGoal", label: "Meta Indicador" },
    {
      key: "createdAt",
      label: "Fecha de Registro",
      valueCallBack: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: "user.name",
      label: "Usuario",
      valueCallBack: (item) =>
        item.user?.names ? item.user.names + " " + item.user.lastNames : "N/A",
    },
  ];

  ngOnInit() {
    this.service = new PatActivityPlanServiceByActivityId(
      this.baseService,
      this.activityId(),
    );
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;

    const dto: CreatePatActivityPlanDto = {
      ...(this.form.value as any),
      activityId: this.activityId(),
    };

    this.baseService.create(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.form.reset({
            plannedBudget: 0,
            plannedBenefit: 0,
            plannedMeasurementGoal: 0,
            plannedIndicatorGoal: 0,
          });
          this.baseService.onSave.next(res.data);
        }
        this.submitting = false;
      },
      error: () => (this.submitting = false),
    });
  }
}

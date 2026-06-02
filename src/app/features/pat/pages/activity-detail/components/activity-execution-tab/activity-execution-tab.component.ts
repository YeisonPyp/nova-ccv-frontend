import { Component, inject, input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import {
  PatActivityExecutionService,
  CreatePatActivityExecutionDto,
  PatActivityExecutionServiceByActivityId,
} from "@/app/core/services/pat/pat-activity-execution.service";
import { CurrencyFormatDirective } from "@/app/shared/directives/currency-format.directive";

@Component({
  selector: "app-activity-execution-tab",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaginationTableComponent,
    CurrencyFormatDirective,
  ],
  templateUrl: "./activity-execution-tab.component.html",
})
export class ActivityExecutionTabComponent implements OnInit {
  activityId = input.required<number>();

  baseService = inject(PatActivityExecutionService);
  service!: PatActivityExecutionServiceByActivityId;

  private fb = inject(FormBuilder);

  submitting = false;

  form = this.fb.group({
    month: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(12)],
    ],
    executedBudget: [0, [Validators.required, Validators.min(0)]],
    executedBenefit: [0, [Validators.required, Validators.min(0)]],
    executedMeasurementGoal: [0, [Validators.required, Validators.min(0)]],
    executedIndicatorGoal: [0, [Validators.required, Validators.min(0)]],
    description: [""],
  });

  columns: TableColumn[] = [
    { key: "month", label: "Mes" },
    { key: "executedBudget", label: "Presupuesto" },
    { key: "executedBenefit", label: "Beneficio" },
    { key: "executedMeasurementGoal", label: "Meta Medición" },
    { key: "executedIndicatorGoal", label: "Meta Indicador" },
    { key: "description", label: "Descripción" },
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
    this.service = new PatActivityExecutionServiceByActivityId(
      this.baseService,
      this.activityId(),
    );
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;

    const dto: CreatePatActivityExecutionDto = {
      ...(this.form.value as any),
      activityId: this.activityId(),
    };

    this.baseService.create(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.form.reset({
            executedBudget: 0,
            executedBenefit: 0,
            executedMeasurementGoal: 0,
            executedIndicatorGoal: 0,
            description: "",
          });
          // Refresh table
          this.baseService.onSave.next(res.data as any);
        }
        this.submitting = false;
      },
      error: () => (this.submitting = false),
    });
  }
}

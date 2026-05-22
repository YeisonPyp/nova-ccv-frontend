// pat/pages/create-program/create-program.component.ts
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { PatApiService } from "../../../../core/services/pat-api.service";
import { AreaService } from "../../../../core/services/assessment/area.service";
import { EmployeeService } from "../../../../core/services/assessment/employee.service";
import { CostCenterService } from "../../../../core/services/cost-center/cost-center.service";
import { SearchSelectComponent } from "../../../../shared/components/search-select/search-select.component";
import { SearchSelectContextFactory } from "../../../../shared/components/search-select/on-search-select.interface";
import { Area } from "../../../../core/models/assessment/area.model";
import { Employee } from "../../../../core/models/assessment/employee.model";
import { CostCenter } from "../../../../core/models/cost-center/cost-center.models";
import { ProgramStatus } from "../../models/pat.models";
import {
  YEAR_OPTIONS,
  PROGRAM_STATUS_CONFIG,
} from "../../utils/pat-status.utils";

@Component({
  selector: "app-create-program",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./create-program.component.html",
  styleUrl: "./create-program.component.scss",
})
export class CreateProgramComponent {
  private readonly patApi = inject(PatApiService);
  private readonly areaService = inject(AreaService);
  private readonly employeeService = inject(EmployeeService);
  private readonly costCenterService = inject(CostCenterService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // ── Opciones desde utils (sin duplicación) ────────────────
  readonly yearOptions = YEAR_OPTIONS;
  readonly statusOptions = Object.entries(PROGRAM_STATUS_CONFIG).map(
    ([value, cfg]) => ({ value: value as ProgramStatus, label: cfg.label }),
  );

  submitting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    code: [
      "",
      [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^PRG-\d{4}-\d{3}$/),
      ],
    ],
    name: ["", [Validators.required, Validators.maxLength(255)]],
    areaId: [null as number | null, Validators.required],
    employeeId: [null as number | null, Validators.required],
    costCenterId: [null as number | null, Validators.required],
    status: ["DRAFT" as ProgramStatus, Validators.required],
    objective: ["", Validators.maxLength(1000)],
    pillar: ["", Validators.maxLength(150)],
    beneficiaries: ["", Validators.maxLength(1000)],
    year: [
      new Date().getFullYear(),
      [Validators.required, Validators.min(2020)],
    ],
    budgetRubric: ["", Validators.maxLength(100)],
    accountingPlan: ["", Validators.maxLength(100)],
  });

  // ── Search-select contexts ────────────────────────────────
  areaCtx: SearchSelectContextFactory<Area> =
    this.areaService.newSearchSelectAreaContext((area) =>
      this.form.patchValue({ areaId: area.id }),
    );

  employeeCtx: SearchSelectContextFactory<Employee> =
    this.employeeService.newSearchSelectEmployeeContext((emp) =>
      this.form.patchValue({ employeeId: emp.id }),
    );

  costCenterCtx: SearchSelectContextFactory<CostCenter> =
    this.costCenterService.newSearchSelectContext((cc) =>
      this.form.patchValue({ costCenterId: cc.id }),
    );

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.invalid);
  }

  onFieldRemove(
    field: string,
    ctx: SearchSelectContextFactory<any>,
    item: any,
  ): void {
    ctx.remove(item);
    this.form.patchValue({ [field]: null });
    this.form.get(field)?.markAsTouched();
  }

  goBack(): void {
    this.router.navigate(["/pat/programs"]);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value;

    this.patApi
      .createProgram({
        code: v.code!,
        name: v.name!,
        areaId: v.areaId!,
        employeeId: v.employeeId!,
        costCenterId: v.costCenterId!,
        status: v.status!,
        objective: v.objective || null,
        pillar: v.pillar || null,
        beneficiaries: v.beneficiaries || null,
        year: v.year!,
        budgetRubric: v.budgetRubric || null,
        accountingPlan: v.accountingPlan || null,
      })
      .subscribe({
        next: (program) => {
          this.submitting.set(false);
          this.router.navigate(["/pat/programs", program.id]);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message ?? "Error al crear el programa");
        },
      });
  }
}

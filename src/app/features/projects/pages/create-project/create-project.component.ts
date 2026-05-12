import { Component, inject, signal } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ProjectService } from "@/app/core/services/projects/project.service";
import { ProjectPriorityService } from "@/app/core/services/projects/project-priority.service";
import { AreaService } from "@/app/core/services/assessment/area.service";
import { CostCenterService } from "@/app/core/services/cost-center/cost-center.service";
import { SearchSelectComponent } from "@/app/shared/components/search-select/search-select.component";
import { SearchSelectContextFactory } from "@/app/shared/components/search-select/on-search-select.interface";
import { ProjectPriority } from "@/app/core/models/projects/project-params.model";
import { Area } from "@/app/core/models/assessment/area.model";
import { CostCenter } from "@/app/core/models/cost-center/cost-center.models";

@Component({
  selector: "app-create-project",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./create-project.component.html",
})
export class CreateProjectComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly priorityService = inject(ProjectPriorityService);
  private readonly areaService = inject(AreaService);
  private readonly costCenterService = inject(CostCenterService);

  submitting = signal(false);
  error = signal<string | null>(null);
  priorities = signal<ProjectPriority[]>([]);

  areaCtx: SearchSelectContextFactory<Area>;
  costCenterCtx: SearchSelectContextFactory<CostCenter>;

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      code: ["", [Validators.required, Validators.maxLength(20)]],
      name: ["", [Validators.required]],
      description: [""],
      areaId: [null, Validators.required],
      costCenterName: ["", Validators.required],
      generalObjective: ["", Validators.required],
      starts: ["", Validators.required],
      ends: ["", Validators.required],
      priorityId: [null, Validators.required],
      budgetAmount: [null, [Validators.required, Validators.min(0)]],
      objectives: this.fb.array([]),
    });

    this.areaCtx = this.areaService.newSearchSelectAreaContext((area) =>
      this.form.patchValue({ areaId: area.id }),
    );

    this.costCenterCtx = this.costCenterService.newSearchSelectContext((cc) =>
      this.form.patchValue({ costCenterName: cc.name }),
    );

    this.priorityService.findAll().subscribe({
      next: (res) => {
        if (res.success && res.data) this.priorities.set(res.data);
      },
    });
  }

  get objectives(): FormArray {
    return this.form.get("objectives") as FormArray;
  }

  addObjective(): void {
    this.objectives.push(
      this.fb.group({
        name: ["", Validators.required],
        description: ["", Validators.required],
      }),
    );
  }

  removeObjective(index: number): void {
    this.objectives.removeAt(index);
  }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.invalid);
  }

  onAreaRemove(item: any): void {
    this.areaCtx.remove(item);
    this.form.patchValue({ areaId: null });
    this.form.get("areaId")?.markAsTouched();
  }

  onCostCenterRemove(item: any): void {
    this.costCenterCtx.remove(item);
    this.form.patchValue({ costCenterName: "" });
    this.form.get("costCenterName")?.markAsTouched();
  }

  goBack(): void {
    this.router.navigate(["/projects"]);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value;

    this.projectService
      .create({
        code: v.code,
        name: v.name,
        description: v.description || undefined,
        areaId: v.areaId,
        costCenterName: v.costCenterName,
        generalObjective: v.generalObjective,
        starts: v.starts,
        ends: v.ends,
        priorityId: Number(v.priorityId),
        budgetAmount: v.budgetAmount,
        objectives: v.objectives ?? [],
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success && res.data) {
            this.router.navigate(["/projects", res.data.id]);
          }
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message ?? "Error al crear el proyecto");
        },
      });
  }
}

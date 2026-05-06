import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CorrectiveActionSectionComponent } from "./corrective-action-section/corrective-action-section.component";
import { ImprovementPlanService, improvementPlanStatus } from "../../../../../core/services/improvement-plan/improvement-plan.service";
import { catchError, debounceTime, distinctUntilChanged, filter, map, of, switchMap } from "rxjs";
import { EmployeeService } from "../../../../../core/services/assessment/employee.service";
import { ControlEntityService } from "../../../../../core/services/improvement-plan/control-entity.service";
import { SearchSelectComponent } from "../../../../../shared/components/search-select/search-select.component";
import { ImprovementPlan } from "../../../../../core/models/improvement-plan/improvement-plan.model";
import { Employee } from "../../../../../core/models/assessment/employee.model";
import { ControlEntity } from "../../../../../core/models/improvement-plan/control-entity.model";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-edit-improvement-plan-modal",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CorrectiveActionSectionComponent,
    SearchSelectComponent,
  ],
  templateUrl: "./edit-improvement-plan-modal.component.html",
  styleUrl: "./edit-improvement-plan-modal.component.scss",
})
export class EditImprovementPlanModalComponent {
  error = signal(null);
  private service = inject(ImprovementPlanService);
  private employeeService = inject(EmployeeService);
  private controlEntityService = inject(ControlEntityService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  searchSelectEmployeesContext =
    this.employeeService.newSearchSelectEmployeeContext((e) => this.updateAssignedEmployee(e), {
      maxItems: 1,
      isRequired: true,
      placeholder: "Empleado responsable...",
      label: "Responsable",
    });

  searchSelectControlEntityContext =
    this.controlEntityService.newSearchSelectControlEntityContext((c) => this.updateControlEntity(c), {
      maxItems: 1,
      isRequired: true,
      placeholder: "Entidad encargada",
      label: "Entidad",
    });

  plan = signal<ImprovementPlan | null>(null);
  planId = signal<number | null>(null);

  get planStatus() {
    return Object.keys(improvementPlanStatus) as Array<keyof typeof improvementPlanStatus>;
  }

  getPlanStatusName(k: keyof typeof improvementPlanStatus): string {
    return improvementPlanStatus[k];
  }

  get assignedName(): string {
    const plan = this.plan();
    if (plan == null || plan?.employee == null) return "";
    const e = plan.employee;
    return `${e.name ?? ""} ${e.lastName ?? ""}`;
  }

  isLoading = computed(() => this.plan() == null && this.error() == null);

  form: FormGroup = this.fb.group({
    name: ["", Validators.required],
    description: ["", Validators.required],
    expiresAt: ["", Validators.required],
    startsAt: [""],
    status: [""]
  });

  constructor() {
    this.route.paramMap.pipe(
      map(params => {
        const id = params.get('id');
        return id ? +id : null;
      }),
      switchMap((id) => {
        this.planId.set(id);
        if (!id) return of(null);
        this.form.valueChanges.pipe(
          debounceTime(800),
          filter(() => this.form.valid),
          distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
          switchMap((value) => this.service.update(id, value))
        ).subscribe({ next: (next) => { this.plan.set(next.data); }, error: (err) => console.log(err) });
        return this.service.findById(id).pipe(
          map((response) => response.data),
          catchError((err) => {
            this.error.set(err);
            return of(null);
          }),
        );
      }),
    ).subscribe((p) => this.plan.set(p));

    effect(() => {
      const p = this.plan();
      if (p) {
        const { name, description, status, expiresAt, controlEntity, employee, startsAt } = p;
        this.form.patchValue({
          name,
          description,
          expiresAt,
          status,
          startsAt
        }, { emitEvent: false });
        if (employee) {
          this.searchSelectEmployeesContext.selectResults([employee]);
        }
        if (controlEntity) {
          this.searchSelectControlEntityContext.selectResults([controlEntity]);
        }
      } else {
        this.form.reset();
        this.searchSelectControlEntityContext.clear();
        this.searchSelectEmployeesContext.clear();
      }
    });
  }

  updateAssignedEmployee(e: Employee) {
    const p = this.plan();
    if (p && e.id !== p.employee?.id) {
      this.service.update(p.id, {
        employeeId: e.id
      }).subscribe((r) => {
        if (r.success && r.data) {
          this.plan.set(r.data);
        }
      });
    }
  }

  updateControlEntity(c: ControlEntity) {
    const p = this.plan();
    if (p && c.id !== p.controlEntityId) {
      this.service.update(p.id, {
        controlEntityId: c.id
      }).subscribe((r) => {
        if (r.success && r.data) {
          this.plan.set(r.data);
        }
      });
    }
  }

  onSavePlan() {
    const p = this.plan();
    const controlEntity = this.searchSelectControlEntityContext.selectedOptions()[0];
    const employee = this.searchSelectEmployeesContext.selectedOptions()[0];
    const { description, expiresAt, name, startsAt } = this.form.value;
    const controlEntityId = controlEntity?.id as number;
    const controlEntityName = controlEntity.title;
    if (p) {
      this.service.update(p.id, {
        controlEntityId,
        controlEntityName,
        description,
        expiresAt,
        name
      }).subscribe((p) => {
        this.plan.set(p.data);
        this.goBack();
      });
    } else {
      this.service.create({
        controlEntityId,
        employeeId: employee.id as number,
        description,
        expiresAt,
        startsAt,
        name
      }).subscribe((p) => {
        this.plan.set(p.data);
        this.goBack();
      });
    }
  }

  goBack(): void {
    this.router.navigate(["/improvement-plan/dashboard"]);
  }
}

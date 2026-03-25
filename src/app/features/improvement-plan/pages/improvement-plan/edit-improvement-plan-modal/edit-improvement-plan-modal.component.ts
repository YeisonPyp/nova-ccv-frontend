import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  Form,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CorrectiveActionSectionComponent } from "./corrective-action-section/corrective-action-section.component";
import { ImprovementPlanService } from "../../../../../core/services/improvement-plan/improvement-plan.service";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { catchError, map, of, switchMap } from "rxjs";
import { EmployeeService } from "../../../../../core/services/assessment/employee.service";
import { ControlEntityService } from "../../../../../core/services/improvement-plan/control-entity.service";
import { SearchSelectComponent } from "../../../../../shared/components/search-select/search-select.component";
import { ImprovementPlan } from "../../../../../core/models/improvement-plan/improvement-plan.model";

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
  isOpen = input(false);
  error = signal(null);
  private service = inject(ImprovementPlanService);
  private employeeService = inject(EmployeeService);
  private controlEntityService = inject(ControlEntityService);
  private readonly fb = inject(FormBuilder);

  onClose = output<void>();
  onSave = output<ImprovementPlan>();

  searchSelectEmployeesContext =
    this.employeeService.newSearchSelectEmployeeContext((_) => { }, {
      maxItems: 1,
      isRequired: true,
      placeholder: "Empleado responsable...",
      label: "Responsable",
    });

  searchSelectControlEntityContext =
    this.controlEntityService.newSearchSelectControlEntityContext((_) => { }, {
      maxItems: 1,
      isRequired: true,
      placeholder: "Entidad encargada",
      label: "Entidad",
    });

  planId = input.required<number | null>();
  plan = signal<ImprovementPlan | null>(null);

  get planStatus(): string {
    if (this.plan() == null) return "";
    return this.plan()?.completedAt ? "COMPLETADO" : "PENDIENTE";
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
    toObservable(this.planId).pipe(
      switchMap((id) => {
        if (!id) return of(null);
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
        const { name, description, expiresAt, controlEntity, employee } = p;
        this.form.patchValue({
          name,
          description,
          expiresAt,
        });
        if (employee) {
          this.searchSelectEmployeesContext.selectResults([employee]);
        }
        if (controlEntity) {
          this.searchSelectControlEntityContext.selectResults([controlEntity]);
        }
      }
    });
  }

  onSavePlan() {
    const p = this.plan();
    const controlEntity = this.searchSelectControlEntityContext.selectedOptions()[0];
    const { description, expiresAt, name } = this.form.value;
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
        this.onSave.emit(p.data);
      });
    } else {
      this.service.create({
        controlEntityId,
        controlEntityName,
        description,
        expiresAt,
        name
      }).subscribe((p) => {
        this.plan.set(p.data);
        this.onSave.emit(p.data);
      });
    }
  }

  onCancel() {
    this.onClose.emit();
  }
}

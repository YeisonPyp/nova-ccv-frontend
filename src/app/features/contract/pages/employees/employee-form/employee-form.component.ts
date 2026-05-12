import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@/app/core/services/auth.service";
import {
  CreateEmployeeDto,
  EmployeeService,
  UpdateEmployeeDto,
} from "@/app/core/services/assessment/employee.service";
import {
  CreateEmployeeScheduleDto,
  EmployeeScheduleService,
} from "@/app/core/services/assessment/employee-schedule.service";
import { PositionService } from "@/app/core/services/assessment/position.service";
import { Employee } from "@/app/core/models/assessment/employee.model";
import { EmployeeSchedule } from "@/app/core/models/assessment/employee-schedule.model";
import { SearchSelectComponent } from "@/app/shared/components/search-select/search-select.component";
import { SearchSelectOption } from "@/app/shared/components/search-select/on-search-select.interface";

const DAY_NAMES: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

@Component({
  selector: "app-employee-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./employee-form.component.html",
})
export class EmployeeFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly employeeService = inject(EmployeeService);
  private readonly scheduleService = inject(EmployeeScheduleService);
  private readonly positionService = inject(PositionService);
  private readonly fb = inject(FormBuilder);

  employeeId = signal<number | null>(null);
  saving = signal(false);

  schedules = signal<EmployeeSchedule[]>([]);
  scheduleLoading = signal(false);
  showScheduleForm = signal(false);
  scheduleFormSaving = signal(false);

  positions = signal<SearchSelectOption[]>([]);
  selectedPositions = signal<SearchSelectOption[]>([]);
  employees = signal<SearchSelectOption[]>([]);
  selectedEmployees = signal<SearchSelectOption[]>([]);

  form: FormGroup = this.fb.group({
    name: ["", [Validators.required]],
    lastName: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    positionId: [null, [Validators.required]],
    employeeReportsToId: [null],
  });

  scheduleForm: FormGroup = this.fb.group({
    weekDay: [null, [Validators.required]],
    startTime: ["", [Validators.required]],
    endTime: ["", [Validators.required]],
  });

  get isEdit() {
    return this.employeeId() !== null;
  }

  get canReadSchedule() {
    return this.auth.hasPermission("EMPLOYEE_SCHEDULE_READ");
  }

  get canCreateSchedule() {
    return this.auth.hasPermission("EMPLOYEE_SCHEDULE_CREATE");
  }

  get canDeleteSchedule() {
    return this.auth.hasPermission("EMPLOYEE_SCHEDULE_DELETE");
  }

  readonly dayNames = DAY_NAMES;
  readonly weekDays = [1, 2, 3, 4, 5, 6, 7];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.employeeId.set(+id);
      this.loadEmployee(+id);
    }
  }

  private loadEmployee(id: number) {
    const employee: Employee | undefined = history.state?.employee;
    if (!employee) {
      this.goBack();
      return;
    }
    this.populateForm(employee);

    if (this.canReadSchedule) {
      this.loadSchedules(id);
    }
  }

  private populateForm(employee: Employee) {
    this.form.patchValue({
      name: employee.name,
      lastName: employee.lastName,
      email: employee.email,
      positionId: employee.position?.id ?? null,
      employeeReportsToId: employee.reportsTo?.id ?? null,
    });
    if (employee.position) {
      this.selectedPositions.set([
        { id: employee.position.id, title: employee.position.name },
      ]);
    }
    if (employee.reportsTo) {
      const r = employee.reportsTo as Employee;
      this.selectedEmployees.set([
        { id: r.id, title: `${r.name} ${r.lastName} (${r.email})` },
      ]);
    }
  }

  loadSchedules(employeeId: number) {
    this.scheduleLoading.set(true);
    this.scheduleService.findByEmployee(employeeId).subscribe({
      next: (res) => {
        if (res.success && res.data) this.schedules.set(res.data);
        this.scheduleLoading.set(false);
      },
      error: () => this.scheduleLoading.set(false),
    });
  }

  findPositions(q: string) {
    this.positionService
      .findPositions({ page: 0, size: 10, name: q })
      .subscribe((r) => {
        if (r.success && r.data) {
          this.positions.set(
            r.data.content.map((p) => ({ id: p.id, title: p.name })),
          );
        }
      });
  }

  findEmployees(q: string) {
    this.employeeService.findEmployees({ nameOrEmail: q }).subscribe((r) => {
      if (r.data && r.success) {
        this.employees.set(
          r.data.content
            .filter((e) => e.id !== this.employeeId())
            .map((e) => ({
              id: e.id,
              title: `${e.name} ${e.lastName} (${e.email})`,
            })),
        );
      }
    });
  }

  onSelectPosition(o: SearchSelectOption) {
    this.selectedPositions.set([o]);
    this.form.patchValue({ positionId: o.id });
  }

  onRemovePosition(_o: SearchSelectOption) {
    this.selectedPositions.set([]);
    this.form.patchValue({ positionId: null });
  }

  onSelectReportsTo(o: SearchSelectOption) {
    this.selectedEmployees.set([o]);
    this.form.patchValue({ employeeReportsToId: o.id });
  }

  onRemoveReportsTo(_o: SearchSelectOption) {
    this.selectedEmployees.set([]);
    this.form.patchValue({ employeeReportsToId: null });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const val = this.form.value;

    if (this.isEdit) {
      const dto: UpdateEmployeeDto = {
        name: val.name,
        lastName: val.lastName,
        email: val.email,
        positionId: val.positionId,
        employeeReportsToId: val.employeeReportsToId,
      };
      this.employeeService.updateEmployee(this.employeeId()!, dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.goBack();
        },
        error: () => this.saving.set(false),
      });
    } else {
      const dto: CreateEmployeeDto = {
        name: val.name,
        lastName: val.lastName,
        email: val.email,
        positionId: val.positionId,
        employeeReportsToId: val.employeeReportsToId,
      };
      this.employeeService.createEmployee(dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.goBack();
        },
        error: () => this.saving.set(false),
      });
    }
  }

  addSchedule() {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }
    const val = this.scheduleForm.value;
    const dto: CreateEmployeeScheduleDto = {
      employeeId: this.employeeId()!,
      weekDay: +val.weekDay,
      utcStartsMinutes: this.timeToMinutes(val.startTime),
      utcEndsMinutes: this.timeToMinutes(val.endTime),
    };
    this.scheduleFormSaving.set(true);
    this.scheduleService.create(dto).subscribe({
      next: () => {
        this.scheduleFormSaving.set(false);
        this.showScheduleForm.set(false);
        this.scheduleForm.reset();
        this.loadSchedules(this.employeeId()!);
      },
      error: () => this.scheduleFormSaving.set(false),
    });
  }

  deleteSchedule(id: number) {
    if (!confirm("¿Eliminar este horario?")) return;
    this.scheduleService.delete(id).subscribe({
      next: () => this.loadSchedules(this.employeeId()!),
    });
  }

  minutesToTime(min: number): string {
    const h = Math.floor(min / 60)
      .toString()
      .padStart(2, "0");
    const m = (min % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  goBack() {
    this.router.navigate(["/assessment/employees/dashboard"]);
  }
}

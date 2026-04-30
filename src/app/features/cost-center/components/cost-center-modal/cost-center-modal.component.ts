import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { toObservable } from "@angular/core/rxjs-interop";
import { switchMap, of } from "rxjs";
import { CostCenterService } from "../../../../core/services/cost-center/cost-center.service";
import { EmployeeService } from "../../../../core/services/assessment/employee.service";
import { SearchSelectComponent } from "../../../../shared/components/search-select/search-select.component";
import {
  CostCenter,
  CreateCostCenterDto,
} from "../../../../core/models/cost-center/cost-center.models";
import { Employee } from "../../../../core/models/assessment/employee.model";

@Component({
  selector: "app-cost-center-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./cost-center-modal.component.html",
  styleUrl: "./cost-center-modal.component.scss",
})
export class CostCenterModalComponent {
  private readonly costCenterService = inject(CostCenterService);
  private readonly employeeService = inject(EmployeeService);
  private readonly fb = inject(FormBuilder);

  isOpen = input(false);
  costCenter = input<CostCenter | null>(null);
  parentId = input<number | null>(null);

  onClose = output<void>();
  onSaved = output<CostCenter>();

  saving = signal(false);
  isViewMode = computed(() => this.costCenter() !== null);

  searchSelectManagerContext = this.employeeService.newSearchSelectEmployeeContext(
    undefined,
    { maxItems: 1, isRequired: true, placeholder: "Buscar responsable..." },
  );

  form: FormGroup = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    totalBudget: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    toObservable(this.costCenter)
      .pipe(switchMap((cc) => {
        this.searchSelectManagerContext.clear();
        if (!cc) {
          this.form.reset({ name: "", description: "", totalBudget: 0 }, { emitEvent: false });
          return of(null);
        }
        this.form.patchValue(
          { name: cc.name, description: cc.description ?? "", totalBudget: cc.totalBudget },
          { emitEvent: false },
        );
        if (cc.managerId && cc.managerName) {
          this.searchSelectManagerContext.selectResults([
            { id: cc.managerId, name: cc.managerName, lastName: cc.managerLastName ?? "" } as Employee,
          ]);
        }
        return of(null);
      }))
      .subscribe();
  }

  get availableBudget(): number {
    const cc = this.costCenter();
    if (!cc) return 0;
    return cc.totalBudget - cc.executedAmount - cc.committedAmount;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const manager = this.searchSelectManagerContext.selectedOptions()[0];
    if (!manager) return;
    this.saving.set(true);
    const dto: CreateCostCenterDto = {
      ...this.form.value,
      managerId: Number(manager.id),
      parentId: this.parentId() ?? undefined,
    };
    this.costCenterService.create(dto).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.onSaved.emit(res.data);
          this.onClose.emit();
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  close(): void {
    this.onClose.emit();
  }
}

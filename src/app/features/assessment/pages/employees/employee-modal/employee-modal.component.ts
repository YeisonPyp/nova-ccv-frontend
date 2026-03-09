import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../../../../../core/services/assessment/employee.service";
import { PositionService } from "../../../../../core/services/assessment/position.service";
import { SearchSelectComponent } from "../../../../../shared/components/search-select/search-select.component";
import { SearchSelectOption } from "../../../../../shared/components/search-select/on-search-select.interface";
import { Employee } from "../../../../../core/models/assessment/employee.model";

@Component({
  selector: "app-employee-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./employee-modal.component.html",
})
export class EmployeeModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() employeeData: Employee | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveEmployee = new EventEmitter<
    CreateEmployeeDto | UpdateEmployeeDto
  >();

  form: FormGroup;
  positions = signal<SearchSelectOption[]>([]);

  selectedPositions = signal<SearchSelectOption[]>([]);
  private positionService = inject(PositionService);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      positionId: [null, [Validators.required]],
      employeeReportsToId: [null],
    });
  }

  findPositions(q: string) {
    this.positionService.findPositions({ page: 1, size: 10, name: q }).subscribe((r) => {
      if (r.success && r.data) {
        this.positions.set(r.data.content.map((p) => ({ id: p.id, title: p.name })));
      }
    });
  }

  onRemovePosition(o: SearchSelectOption) {
    this.selectedPositions.set(this.selectedPositions().filter((p) => p.id !== o.id));
  }

  onSelectPosition(o: SearchSelectOption) {
    this.selectedPositions.set([o]);
    this.form.patchValue({ positionId: o.id });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.form.reset();
      this.selectedPositions.set([]);
    }
    if (changes["employeeData"] && this.employeeData && this.isOpen) {
      this.form.patchValue({
        name: this.employeeData.name || "",
        lastName: this.employeeData.lastName || "",
        email: this.employeeData.email || "",
        positionId: this.employeeData.position?.id || null, // Ensure your employee model returns full position details, but standard requires id
        employeeReportsToId: this.employeeData.reportsTo || null,
      });
      if (this.employeeData.position) {
        this.selectedPositions.set([{id: this.employeeData.position.id, title: this.employeeData.position.name }])
      }
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  onSubmit() {
    if (this.form.valid) {
      this.saveEmployee.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}

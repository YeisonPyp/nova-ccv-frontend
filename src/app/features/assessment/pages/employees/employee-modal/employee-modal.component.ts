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
  EmployeeService,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../../../../../core/services/assessment/employee.service";
import { PositionService } from "../../../../../core/services/assessment/position.service";
import { Position } from "../../../../../core/models/assessment/position.model";

@Component({
  selector: "app-employee-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./employee-modal.component.html",
})
export class EmployeeModalComponent implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() employeeData: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveEmployee = new EventEmitter<
    CreateEmployeeDto | UpdateEmployeeDto
  >();

  form: FormGroup;
  positions = signal<Position[]>([]);
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

  ngOnInit() {
    this.positionService
      .findPositions({ size: 100, page: 1 })
      .subscribe((res) => {
        if (res.data && res.data.content) this.positions.set(res.data.content);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.form.reset();
    }
    if (changes["employeeData"] && this.employeeData && this.isOpen) {
      this.form.patchValue({
        name: this.employeeData.name || "",
        lastName: this.employeeData.lastName || "",
        email: this.employeeData.email || "",
        positionId: this.employeeData.position?.id || null, // Ensure your employee model returns full position details, but standard requires id
        employeeReportsToId: this.employeeData.reportsTo || null,
      });
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

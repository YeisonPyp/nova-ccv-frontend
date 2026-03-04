import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { PeriodService } from "../../../../../core/services/assessment/period.service";
import { Period } from "../../../../../core/models/assessment/period.model";
import { EmployeeService } from "../../../../../core/services/assessment/employee.service";
import { Employee } from "../../../../../core/models/assessment/employee.model";

export interface CreateAssessmentDto {
  evaluateeId: number;
  evaluatorId?: number;
  periodId?: number;
}

@Component({
  selector: "app-create-assessment-modal",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-assessment-modal.component.html",
  styleUrl: "./create-assessment-modal.component.scss",
})
export class CreateAssessmentModalComponent implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveAssessment = new EventEmitter<CreateAssessmentDto>();

  assessmentForm: FormGroup;
  periods = signal<Period[]>([]);
  employees = signal<Employee[]>([]);
  
  evaluateeSearchTerm = signal("");
  evaluatorSearchTerm = signal("");
  isEvaluateeDropdownOpen = signal(false);
  isEvaluatorDropdownOpen = signal(false);

  private periodService = inject(PeriodService);
  private employeeService = inject(EmployeeService);

  constructor(private fb: FormBuilder) {
    this.assessmentForm = this.fb.group({
      evaluateeId: [null, Validators.required],
      evaluatorId: [null],
      periodId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.periodService
      .findCurrentPeriods({ size: 100 })
      .subscribe((response) => {
        if (response.data && response.data.content) {
          this.periods.set(response.data.content);
        }
      });
    this.searchEmployees();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.assessmentForm.reset();
      this.evaluateeSearchTerm.set("");
      this.evaluatorSearchTerm.set("");
      this.isEvaluateeDropdownOpen.set(false);
      this.isEvaluatorDropdownOpen.set(false);
    }
  }

  onSearchEvaluatee(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.evaluateeSearchTerm.set(input.value);
    this.searchEmployees(input.value);
    this.isEvaluateeDropdownOpen.set(true);
    this.assessmentForm.patchValue({ evaluateeId: null });
  }

  onSearchEvaluator(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.evaluatorSearchTerm.set(input.value);
    this.searchEmployees(input.value);
    this.isEvaluatorDropdownOpen.set(true);
    this.assessmentForm.patchValue({ evaluatorId: null });
  }

  private searchEmployees(searchTerm: string = ""): void {
    this.employeeService
      .findEmployees({ size: 50, search: searchTerm })
      .subscribe((response) => {
        if (response.data && response.data.content) {
          this.employees.set(response.data.content);
        }
      });
  }

  selectEvaluatee(employee: Employee): void {
    this.assessmentForm.patchValue({ evaluateeId: employee.id });
    this.evaluateeSearchTerm.set(`${employee.name} ${employee.lastName}`);
    this.isEvaluateeDropdownOpen.set(false);
  }

  selectEvaluator(employee: Employee): void {
    this.assessmentForm.patchValue({ evaluatorId: employee.id });
    this.evaluatorSearchTerm.set(`${employee.name} ${employee.lastName}`);
    this.isEvaluatorDropdownOpen.set(false);
  }

  closeDropdowns(): void {
    this.isEvaluateeDropdownOpen.set(false);
    this.isEvaluatorDropdownOpen.set(false);
  }

  onClose() {
    this.closeModal.emit();
  }

  onSubmit() {
    if (this.assessmentForm.valid) {
      this.saveAssessment.emit(this.assessmentForm.value);
    } else {
      this.assessmentForm.markAllAsTouched();
    }
  }
}

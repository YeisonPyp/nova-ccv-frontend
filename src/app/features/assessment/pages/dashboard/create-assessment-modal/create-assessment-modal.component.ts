import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  inject,
  input,
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
import { SearchSelectComponent } from "../../../../../shared/components/search-select/search-select.component";
import { SearchSelectOption } from "../../../../../shared/components/search-select/on-search-select.interface";

export interface CreateAssessmentDto {
  evaluateeId: number;
  periodId: number;
}

@Component({
  selector: "app-create-assessment-modal",
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./create-assessment-modal.component.html",
  styleUrl: "./create-assessment-modal.component.scss",
})
export class CreateAssessmentModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveAssessment = new EventEmitter<CreateAssessmentDto>();
  currentPeriod = input.required<Period | undefined>();

  assessmentForm: FormGroup;
  periods = signal<SearchSelectOption[]>([]);
  employees = signal<Employee[]>([]);
  selectedPeriods = signal<Array<SearchSelectOption>>([]);
  selectedEvaluatee = signal<Array<SearchSelectOption>>([]);

  private periodService = inject(PeriodService);
  private employeeService = inject(EmployeeService);

  constructor(private fb: FormBuilder) {
    this.assessmentForm = this.fb.group({
      evaluateeId: [null, Validators.required],
      periodId: [null, Validators.required],
    });
  }

  get searchSelectOptions(): Array<SearchSelectOption> {
    return this.employees().map((emp) => ({
      id: emp.id,
      title: `${emp.name ?? ''} ${emp.lastName ?? ''} (${emp.email ?? ''})`,
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.assessmentForm.reset();
      const currentPeriod = this.currentPeriod();
      if (currentPeriod) {
        this.selectedPeriods.set([{ id: currentPeriod.id, title: currentPeriod.name }]);
        this.assessmentForm.patchValue({ periodId: currentPeriod.id });
      }
    }
  }

  onSearchEvaluatee(s: string): void {
    this.searchEmployees(s);
    this.assessmentForm.patchValue({ evaluateeId: null });
  }

  onSearchPeriod(s: string) {
    this.periodService.findCurrentPeriods({ name: s }).subscribe((r) => {
      if (r.data && r.success) {
        this.periods.set(r.data.content.map((p) => ({ id: p.id, title: p.name })));
      }
    })
  }

  onSelectPeriod(option: SearchSelectOption) {
    this.selectedPeriods.set([option]);
    this.assessmentForm.patchValue({ periodId: option.id });
  }

  onRemovePeriod(optoin: SearchSelectOption) {
    this.selectedPeriods.set([]);
  }

  onSearchEvaluator(s: string): void {
    this.searchEmployees(s);
    this.assessmentForm.patchValue({ evaluatorId: null });
  }

  private searchEmployees(searchTerm: string = ""): void {
    this.employeeService
      .findEmployees({ size: 50, nameOrEmail: searchTerm })
      .subscribe((response) => {
        if (response.data && response.data.content) {
          this.employees.set(response.data.content);
        }
      });
  }

  selectEvaluatee(option: SearchSelectOption): void {
    this.assessmentForm.patchValue({ evaluateeId: option.id });
    this.selectedEvaluatee.set([option]);
    this.employees.set([]);
  }

  onRemoveEvaluatee(option: SearchSelectOption): void {
    this.assessmentForm.patchValue({ evaluateeId: null });
    this.selectedEvaluatee.set([]);
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

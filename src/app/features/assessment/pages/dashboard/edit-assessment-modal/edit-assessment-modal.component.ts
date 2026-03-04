import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Assessment } from '../../../../../core/models/assessment/assessment.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Competencie } from '../../../../../core/models/assessment/competencie.model';

export interface CompetencyAssessmentDto {
  [competencyId: number]: number | null; // competencyId: score
}

export interface EditAssesmentDto {
  id: number;
  competencyScores: CompetencyAssessmentDto;
  observations?: string;
  agreements?: string;
  aspectsToImprove?: string;
}

@Component({
  selector: 'app-edit-assessment-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-assessment-modal.component.html',
  styleUrl: './edit-assessment-modal.component.scss'
})
export class EditAssessmentModalComponent implements OnInit, OnChanges{
  @Input() isOpen = false;
  assessment = input.required<Assessment>();

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveAssessment = new EventEmitter<EditAssesmentDto>();

  assessmentForm: FormGroup;
  competencyScores: FormGroup;

  constructor(private fb: FormBuilder) {
    this.assessmentForm = this.fb.group({});
    this.competencyScores = this.fb.group({});
  }
  ngOnInit(): void {
    const competencyControls: {[key:number] : Validators} = {};
    (this.assessment().position?.competencies ?? []).reduce((group, competency) => {
      group[competency.id] = [0, Validators.required];
      return group;
    }, competencyControls);

    this.competencyScores = this.fb.group(competencyControls);
    

    this.assessmentForm = this.fb.group({
      observations: [''],
      agreements: [''],
      aspectsToImprove: [''],
      id: [this.assessment().id, Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reset the form when the modal is closed
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.assessmentForm.reset();
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
      if (this.assessmentForm.valid) {
        const formValue = this.assessmentForm.value;
  
        const payload: EditAssesmentDto = {
          competencyScores: formValue.competencyScores,
          observations: formValue.observations,
          agreements: formValue.agreements,
          aspectsToImprove: formValue.aspectsToImprove,
          id: formValue.id
        };
  
        this.saveAssessment.emit(payload);
      } else {
        this.assessmentForm.markAllAsTouched();
      }
  }

  get evaluatorFullName(): string {
    const evaluator = this.assessment().evaluator;
    return `${evaluator?.name ?? ''} ${evaluator?.lastName ?? ''}`;
  }

  get evaluateeFullName(): string {
    const evaluatee = this.assessment().evaluatee;
    return `${evaluatee?.name ?? ''} ${evaluatee?.lastName ?? ''}`;
  }

  get evaluationPeriodRange(): string  {
    const period = this.assessment().period;
    if (!period) return '';
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return `${startDate.getDate()} - ${endDate.getDate()}`;
  }

  get evaluationDate(): string {
    return new Date(this.assessment().createdAt).getDate().toLocaleString();
  }

  get competencies(): Array<Competencie>{
    return this.assessment().position?.competencies ?? [];
  }
}

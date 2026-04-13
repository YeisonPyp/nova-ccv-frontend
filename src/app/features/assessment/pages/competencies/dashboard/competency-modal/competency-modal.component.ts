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
  CreateCompetencyDto,
  CompetencyEnum,
} from "../../../../../../core/services/assessment/competencie.service";
import { PositionService } from "../../../../../../core/services/assessment/position.service";
import { Position } from "../../../../../../core/models/assessment/position.model";

@Component({
  selector: "app-competency-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./competency-modal.component.html",
  styleUrls: [
    "../../../dashboard/create-assessment-modal/create-assessment-modal.component.scss",
  ],
})
export class CompetencyModalComponent implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveCompetency = new EventEmitter<CreateCompetencyDto>();

  form: FormGroup;
  positions = signal<Position[]>([]);
  private positionService = inject(PositionService);

  competencyTypes = [
    { value: CompetencyEnum.BEHAVIORAL, label: "Conductual" },
    { value: CompetencyEnum.TECHNICAL, label: "Técnica" },
    { value: CompetencyEnum.CORE, label: "Core / Transversal" },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ["", [Validators.required]],
      type: [null, [Validators.required]],
      description: ["", [Validators.required]],
      minScore: [0, [Validators.required]],
      maxScore: [5, [Validators.required]],
      positions: [[]],
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
  }

  onClose() {
    this.closeModal.emit();
  }

  onSubmit() {
    if (this.form.valid) {
      this.saveCompetency.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}

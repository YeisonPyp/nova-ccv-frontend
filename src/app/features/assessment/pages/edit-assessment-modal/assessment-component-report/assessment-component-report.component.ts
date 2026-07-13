import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  AssessmentComponentReport,
  AssessmentComponentReportSupport,
} from "@/app/core/models/assessment/assessment.model";
import { PositionAssessmentComponent } from "@/app/core/models/assessment/position.model";
import { ScoreSliderComponent } from "../score-slider/score-slider.component";
import { distinctUntilChanged, filter } from "rxjs";
import { FileItemComponent } from "@/app/shared/components/file-item/file-item.component";

export interface ReportScoreChange {
  reportId: number;
  score: number;
  observations: string;
}

@Component({
  selector: "app-assessment-component-report",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ScoreSliderComponent,
    FileItemComponent,
    ReactiveFormsModule,
  ],
  templateUrl: "./assessment-component-report.component.html",
})
export class AssessmentComponentReportCardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  report = input.required<AssessmentComponentReport>();

  onChange = output<ReportScoreChange>();
  onViewSupport = output<number>();
  onDeleteSupport = output<number>();

  positionComponent = computed<PositionAssessmentComponent>(
    () => this.report().component,
  );

  scoreControl = new FormControl(0);
  observationsControl = new FormControl("");

  form = this.fb.group({
    score: this.scoreControl,
    observations: this.observationsControl,
  });

  constructor() {
    effect(() => {
      const r = this.report();
      this.scoreControl.setValue(r.score);
      this.observationsControl.setValue(r.observations);

      if (r.component) {
        this.scoreControl.addValidators([
          Validators.max(r.component.maxValue),
          Validators.min(r.component.minValue),
        ]);
        this.scoreControl.updateValueAndValidity();
      }
    });
  }

  getSupportsForRequirement(id: number): AssessmentComponentReportSupport[] {
    return this.report().supports?.filter((s) => s.requirementId === id) ?? [];
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        filter(() => this.form.valid),
        distinctUntilChanged(),
      )
      .subscribe((values) => {
        this.onChange.emit({
          reportId: this.report().id,
          score: values.score || 0,
          observations: values.observations || "",
        });
      });
  }
}

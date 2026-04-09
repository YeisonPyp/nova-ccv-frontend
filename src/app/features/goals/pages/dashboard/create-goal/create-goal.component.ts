import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { GoalService } from "../../../../../core/services/goals/goal.service";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { GoalTemplate } from "../../../../../core/models/goals/goal-template.model";
import { GoalVarTableComponent } from "./goal-var-table/goal-var-table.component";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  CreateGoalFromTemplate,
  Goal,
} from "../../../../../core/models/goals/goal.model";
import { GoalVar } from "../../../../../core/models/goals/goal-var.model";
import { GoalOption } from "../../../../../core/models/goals/goal-option.model";

@Component({
  selector: "app-create-goal",
  standalone: true,
  imports: [CommonModule, GoalVarTableComponent, ReactiveFormsModule],
  templateUrl: "./create-goal.component.html",
  styleUrl: "./create-goal.component.scss",
})
export class CreateGoalComponent implements OnChanges {
  goalService = inject(GoalService);
  fb = inject(FormBuilder);

  isOpen = input.required<boolean>();
  onClose = output<void>();
  onSaved = output<Goal>();

  goalTemplates = toSignal(
    this.goalService.findAllGoalTemplates().pipe(map((r) => r.data ?? [])),
  );

  selectedTemplate = signal<GoalTemplate | null>(null);

  goalVars = computed(() => this.selectedTemplate()?.vars ?? []);

  goalVarsValues = signal<CreateGoalFromTemplate["vars"]>({});

  formGroup = this.fb.group({
    templateId: [0, Validators.required],
    description: ["", Validators.required],
    deviation: [0, Validators.required],
    targetValue: [0, Validators.required],
    title: ["", Validators.required],
    weight: [0, Validators.required],
    patProgramId: [0],
  });

  constructor() {
    effect(
      () => {
        this.selectedTemplate();
        this.goalVarsValues.set({});
      },
      { allowSignalWrites: true },
    );

    toObservable(this.selectedTemplate).subscribe((t) => {
      this.formGroup.patchValue({ templateId: t?.id });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {}

  onSelectOption(goalVar: GoalVar, option: GoalOption) {
    this.goalVarsValues.update((v) => {
      v[goalVar.varName] = option.value;
      return v;
    });
  }

  $onClose() {
    this.onClose.emit();
  }

  onSubmit() {
    this.goalService
      .createGoalFromTemplate(this.formGroup.value as CreateGoalFromTemplate)
      .subscribe((r) => {
        if (r.success) {
          this.onSaved.emit(r.data);
          this.onClose.emit();
        }
      });
  }
}

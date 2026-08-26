import { Component, computed, effect, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { GoalService } from "@/app/core/services/goals/goal.service";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { GoalTemplate } from "@/app/core/models/goals/goal-template.model";
import { GoalVarTableComponent } from "./goal-var-table/goal-var-table.component";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CreateGoalFromTemplate } from "@/app/core/models/goals/goal.model";
import { GoalVar } from "@/app/core/models/goals/goal-var.model";
import { GoalOption } from "@/app/core/models/goals/goal-option.model";
import { Router } from "@angular/router";

@Component({
  selector: "app-create-goal",
  standalone: true,
  imports: [CommonModule, GoalVarTableComponent, ReactiveFormsModule],
  templateUrl: "./create-goal.component.html",
  styleUrl: "./create-goal.component.scss",
})
export class CreateGoalComponent {
  goalService = inject(GoalService);
  fb = inject(FormBuilder);
  router = inject(Router);

  goalTemplates = toSignal(
    this.goalService.findAllGoalTemplates().pipe(map((r) => r.data ?? [])),
  );

  selectedTemplate = signal<GoalTemplate | null>(null);

  goalVars = computed(() => this.selectedTemplate()?.vars ?? []);

  goalVarsValues = signal<Record<string, GoalOption>>({});

  formGroup = this.fb.group({
    templateId: [0, Validators.required],
    description: ["", Validators.required],
    deviation: [0, Validators.required],
    targetValue: [0, Validators.required],
    title: ["", Validators.required],
    weight: [0, Validators.required],
    patProgramId: [null],
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

  onSelectOption(goalVar: GoalVar, option: GoalOption) {
    this.goalVarsValues.update((v) => {
      v[goalVar.varName] = option;
      return v;
    });
  }

  cancel() {
    this.router.navigate(["/goals/dashboard"]);
  }

  onSubmit() {
    const vars = Object.fromEntries(
      Object.entries(this.goalVarsValues()).map(([k, v]) => [k, v.value]),
    );
    this.goalService
      .createGoalFromTemplate({
        ...this.formGroup.value,
        vars,
      } as CreateGoalFromTemplate)
      .subscribe((r) => {
        if (r.success) {
          this.router.navigate(["/goals/dashboard"]);
        }
      });
  }
}

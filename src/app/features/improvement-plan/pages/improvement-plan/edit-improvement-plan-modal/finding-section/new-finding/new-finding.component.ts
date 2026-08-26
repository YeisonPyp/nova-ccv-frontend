import { CommonModule } from "@angular/common";
import { Component, inject, input, output } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { FindingService } from "@/app/core/services/improvement-plan/finding.service";
import {
  FindingDto,
  FindingType,
  findingTypeLabels,
} from "@/app/core/models/improvement-plan/finding.model";

@Component({
  selector: "app-new-finding",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./new-finding.component.html",
  styleUrl: "./new-finding.component.scss",
})
export class NewFindingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FindingService);

  planId = input.required<number>();

  onCreated = output<FindingDto>();

  form = this.fb.group({
    type: ["NONCONFORMITY" as FindingType, Validators.required],
    name: ["", [Validators.required, Validators.maxLength(255)]],
    description: ["", Validators.required],
  });

  get findingTypes(): FindingType[] {
    return Object.keys(findingTypeLabels) as FindingType[];
  }

  getFindingTypeLabel(type: FindingType): string {
    return findingTypeLabels[type];
  }

  onSubmit(): void {
    if (!this.form.valid) return;
    const { type, name, description } = this.form.value;
    this.service
      .create({
        improvementPlanId: this.planId(),
        type: type!,
        name: name!,
        description: description!,
      })
      .subscribe((r) => {
        if (r.success) {
          this.onCreated.emit(r.data);
          this.form.reset({ type: "NONCONFORMITY", name: "", description: "" });
        }
      });
  }
}

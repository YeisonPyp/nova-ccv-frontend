import {
  Component,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { EvidenceItemComponent } from "../evidence-item/evidence-item.component";
import { CorrectiveActionService } from "@/app/core/services/improvement-plan/corrective-action.service";
import {
  CorrectiveActionDto,
  CreateCorrectiveActionDto,
  UpdateCorrectiveActionDto,
} from "@/app/core/models/improvement-plan/corrective-action.model";

@Component({
  selector: "app-corrective-action-item",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EvidenceItemComponent],
  templateUrl: "./corrective-action-item.component.html",
  styleUrls: ["./corrective-action-item.component.scss"],
})
export class CorrectiveActionItemComponent implements OnInit {
  private fb = inject(FormBuilder);
  private correctiveActionService = inject(CorrectiveActionService);

  action = input<CorrectiveActionDto>();
  planId = input.required<number>();
  parentId = input<number>();
  isNew = input<boolean>(false);

  @Output() onActionChange = new EventEmitter<void>();

  form!: FormGroup;
  isEditing = signal(false);
  loading = signal(false);

  ngOnInit(): void {
    if (this.isNew()) {
      this.isEditing.set(true);
    }
    this.initForm();
  }

  initForm(): void {
    const currentAction = this.action();
    this.form = this.fb.group({
      name: [currentAction?.name || "", Validators.required],
      description: [currentAction?.description || "", Validators.required],
      status: [currentAction?.status || "PENDING"],
      followUp: [currentAction?.followUp || "", Validators.required],
      progress: [
        currentAction?.progress || 0,
        [Validators.min(0), Validators.max(100)],
      ],
    });
  }

  enableEdit(): void {
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    if (this.isNew()) {
      this.form.reset();
      this.form.patchValue({ status: "PENDING", progress: 0 });
    } else {
      this.isEditing.set(false);
      this.initForm();
    }
  }

  saveAction(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    const formValue = this.form.value;

    if (this.isNew()) {
      const createDto: CreateCorrectiveActionDto = {
        ...formValue,
        improvementPlanId: this.planId(),
        parentId: this.parentId(),
      };

      this.correctiveActionService.create(createDto).subscribe({
        next: (res) => {
          if (res.success) {
            this.form.reset({ status: "PENDING", progress: 0 });
            this.notifyChange();
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      const currentAction = this.action();
      if (!currentAction) return;

      const updateDto: UpdateCorrectiveActionDto = {
        ...formValue,
        parentId: currentAction.parentId,
      };

      this.correctiveActionService
        .update(currentAction.id, updateDto)
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.isEditing.set(false);
              this.notifyChange();
            }
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
    }
  }

  deleteAction(): void {
    const currentAction = this.action();
    if (!currentAction) return;

    if (
      confirm(
        `¿Eliminar la acción "${currentAction.name}" y todo su contenido?`,
      )
    ) {
      this.correctiveActionService.deleteById(currentAction.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.notifyChange();
          }
        },
      });
    }
  }

  notifyChange(): void {
    this.onActionChange.emit();
  }
}

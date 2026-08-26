import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ControlEntityService } from "@/app/core/services/improvement-plan/control-entity.service";
import {
  ControlEntity,
  CreateControlEntityDto,
  UpdateControlEntityDto,
} from "@/app/core/models/improvement-plan/control-entity.model";

@Component({
  selector: "app-control-entity-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./control-entity-modal.component.html",
  styleUrl: "./control-entity-modal.component.scss",
})
export class ControlEntityModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ControlEntityService);

  @Input() isOpen = false;
  entity = input<ControlEntity | null>(null);
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    name: ["", Validators.required],
  });

  loading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.form.reset();
    }
    if (changes["entity"] && changes["entity"].currentValue) {
      this.form.patchValue({ name: this.entity()?.name });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const e = this.entity();
    const obs$ =
      e != null
        ? this.service.update(e.id, this.form.value as UpdateControlEntityDto)
        : this.service.create(this.form.value as CreateControlEntityDto);

    obs$.subscribe({
      next: (res) => {
        this.saved.emit();
        this.close.emit();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onClose() {
    this.close.emit();
  }
}

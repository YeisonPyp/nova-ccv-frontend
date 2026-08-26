import { CommonModule } from "@angular/common";
import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";

export interface PatUpsertField {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea";
  required?: boolean;
  maxLength?: number;
}

@Component({
  selector: "app-pat-upsert-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        (click)="close()"
      >
        <div
          class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-secondary m-0">
              {{
                editing() ? "Editar " + entityName() : "Nuevo " + entityName()
              }}
            </h3>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 text-xl leading-none"
              (click)="close()"
            >
              ×
            </button>
          </div>

          @if (error()) {
            <div
              class="mb-3 px-3 py-2 rounded bg-red-50 text-red-700 text-xs border border-red-200"
            >
              {{ error() }}
            </div>
          }

          <form
            [formGroup]="form"
            (ngSubmit)="submit()"
            class="flex flex-col gap-3"
          >
            @for (f of fields(); track f.key) {
              <div class="flex flex-col gap-1">
                <label
                  class="text-[0.7rem] font-medium text-gray-500 uppercase tracking-wide"
                >
                  {{ f.label }}
                  @if (f.required) {
                    <span class="text-red-500">*</span>
                  }
                </label>
                @if (f.type === "textarea") {
                  <textarea
                    [formControlName]="f.key"
                    rows="3"
                    class="text-sm rounded border border-gray-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  ></textarea>
                } @else {
                  <input
                    [type]="f.type ?? 'text'"
                    [formControlName]="f.key"
                    class="text-sm rounded border border-gray-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                }
              </div>
            }

            <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                class="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                (click)="close()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 disabled:opacity-50"
                [disabled]="saving() || form.invalid"
              >
                {{ saving() ? "Guardando..." : "Guardar" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class PatUpsertModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly entityName = input.required<string>();
  readonly fields = input.required<PatUpsertField[]>();
  readonly editing = input<{ id: number; [k: string]: any } | null>(null);
  readonly service = input.required<FilterServiceSpecImpl<any, any>>();

  readonly onClose = output<void>();
  readonly onSaved = output<void>();

  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({});
  saving = signal(false);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const fs = this.fields();
      const grp: Record<string, any> = {};
      for (const f of fs) {
        grp[f.key] = ["", f.required ? [Validators.required] : []];
      }
      this.form = this.fb.group(grp);

      const e = this.editing();
      if (e) {
        const patch: Record<string, any> = {};
        for (const f of fs) patch[f.key] = e[f.key] ?? "";
        this.form.patchValue(patch);
      } else {
        this.form.reset();
      }
      this.error.set(null);
    });
  }

  close() {
    this.onClose.emit();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const dto = this.form.getRawValue();
    const e = this.editing();
    const req$ = e
      ? this.service().update(e.id, dto)
      : this.service().create(dto);
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.onSaved.emit();
        this.form.reset();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? "Error al guardar");
      },
    });
  }
}

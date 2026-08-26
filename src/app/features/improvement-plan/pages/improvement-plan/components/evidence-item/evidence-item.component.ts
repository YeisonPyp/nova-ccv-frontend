import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { EvidenceService } from '@/app/core/services/improvement-plan/evidence.service';
import {
  CreateEvidenceDto,
  EvidenceDto,
} from '@/app/core/models/improvement-plan/evidence.model';
import {
  FileItemComponent,
  FileResource,
} from '@/app/shared/components/file-item/file-item.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-evidence-item',
  standalone: true,
  imports: [CommonModule, FileItemComponent, FormsModule],
  template: `
    <div class="flex flex-col gap-5 w-full">
      @if (evidence() && !expanded()) {
        <button
          type="button"
          class="relative h-40 w-full flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all shadow-sm"
          (click)="expanded.set(true)"
        >
          <svg
            class="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span
            class="text-[11px] font-semibold text-gray-500 px-2 truncate max-w-full"
          >
            {{
              evidence()?.description || evidence()?.objectName || 'Evidencia'
            }}
          </span>
          <span
            class="text-[10px] text-primary font-bold uppercase tracking-wide"
          >
            Ver archivo
          </span>
        </button>
      } @else {
        <app-file-item
          [file]="fileResource()"
          [loading]="loading()"
          [uploadProgress]="uploadProgress()"
          label="Añadir evidencia"
          accept="image/*,.pdf"
          (fileSelected)="onFileSelected($event)"
          (deleteRequested)="onDeleteRequested()"
        />
      }
      <label class="form-label">Descripción:</label>
      <input class="form-control" type="text" [(ngModel)]="description" />
    </div>
  `,
  styleUrls: ['./evidence-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvidenceItemComponent {
  private readonly evidenceService = inject(EvidenceService);

  evidence = input<EvidenceDto | null>(null);
  followUpId = input.required<number>();

  onSaved = output<EvidenceDto>();
  onRemoved = output<EvidenceDto>();

  loading = signal(false);
  uploadProgress = signal(0);
  description = signal<string | null>(null);
  expanded = signal(false);

  fileResource = computed((): FileResource | null => {
    const e = this.evidence();
    if (!e) return null;
    return {
      id: e.id,
      bucketName: e.bucketName ?? '',
      fileName: e.objectName ?? '',
      description: e.description,
      createdAt: e.createdAt,
    };
  });
  constructor() {
    effect(() => {
      this.description.set(this.evidence()?.description || null);
    });
  }

  onFileSelected(file: File): void {
    const prev = this.evidence();
    const dto: CreateEvidenceDto = {
      followUpId: this.followUpId(),
      file,
      description: this.description(),
    };
    const obs$ = prev?.id
      ? this.evidenceService.update(prev.id, dto)
      : this.evidenceService.create(dto);

    obs$.subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress.set(
            Math.round((100 * event.loaded) / (event.total ?? 1)),
          );
        } else if (event.type === HttpEventType.Response && event.body?.data) {
          this.uploadProgress.set(0);
          this.expanded.set(true);
          this.onSaved.emit(event.body.data);
        }
      },
      error: () => {
        this.loading.set(false);
        this.uploadProgress.set(0);
      },
    });
  }

  onDeleteRequested(): void {
    const e = this.evidence();
    if (!e) return;
    this.loading.set(true);
    this.evidenceService.deleteById(e.id).subscribe({
      next: (res) => {
        if (res.success) this.onRemoved.emit(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

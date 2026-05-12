import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpEventType } from "@angular/common/http";
import { EvidenceService } from "@/app/core/services/improvement-plan/evidence.service";
import { EvidenceDto } from "@/app/core/models/improvement-plan/evidence.model";
import {
  FileItemComponent,
  FileResource,
} from "@/app/shared/components/file-item/file-item.component";

@Component({
  selector: "app-evidence-item",
  standalone: true,
  imports: [CommonModule, FileItemComponent],
  template: `
    <app-file-item
      [file]="fileResource()"
      [loading]="loading()"
      [uploadProgress]="uploadProgress()"
      label="Añadir evidencia"
      accept="image/*,.pdf"
      (fileSelected)="onFileSelected($event)"
      (deleteRequested)="onDeleteRequested()"
    />
  `,
  styleUrls: ["./evidence-item.component.scss"],
})
export class EvidenceItemComponent {
  private readonly evidenceService = inject(EvidenceService);

  evidence = input<EvidenceDto | null>(null);
  actionId = input.required<number>();

  onSaved = output<EvidenceDto>();
  onRemoved = output<EvidenceDto>();

  loading = signal(false);
  uploadProgress = signal(0);

  fileResource = computed((): FileResource | null => {
    const e = this.evidence();
    if (!e) return null;
    return {
      id: e.id,
      bucketName: e.bucketName ?? "",
      fileName: e.objectName ?? "",
      description: e.description,
      createdAt: e.createdAt,
    };
  });

  onFileSelected(file: File): void {
    const prev = this.evidence();
    const dto = { correctiveActionId: this.actionId(), file };
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

import { Component, computed, inject, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpEventType } from "@angular/common/http";
import { FindingDocumentService } from "@/app/core/services/improvement-plan/finding-document.service";
import { FindingDocumentDto } from "@/app/core/models/improvement-plan/finding-document.model";
import {
  FileItemComponent,
  FileResource,
} from "@/app/shared/components/file-item/file-item.component";

@Component({
  selector: "app-finding-document-item",
  standalone: true,
  imports: [CommonModule, FileItemComponent],
  template: `
    <app-file-item
      [file]="fileResource()"
      [loading]="loading()"
      [uploadProgress]="uploadProgress()"
      label="Añadir documento"
      accept="image/*,.pdf"
      (fileSelected)="onFileSelected($event)"
      (deleteRequested)="onDeleteRequested()"
    />
  `,
})
export class FindingDocumentItemComponent {
  private readonly findingDocumentService = inject(FindingDocumentService);

  document = input<FindingDocumentDto | null>(null);
  findingId = input.required<number>();

  onSaved = output<FindingDocumentDto>();
  onRemoved = output<FindingDocumentDto>();

  loading = signal(false);
  uploadProgress = signal(0);

  fileResource = computed((): FileResource | null => {
    const d = this.document();
    if (!d) return null;
    return {
      id: d.id,
      bucketName: d.bucketName ?? "",
      fileName: d.fileName ?? "",
      description: d.description,
      createdAt: d.createdAt,
    };
  });

  onFileSelected(file: File): void {
    const prev = this.document();
    const dto = { findingId: this.findingId(), file };
    const obs$ = prev?.id
      ? this.findingDocumentService.update(prev.id, dto)
      : this.findingDocumentService.create(dto);

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
    const d = this.document();
    if (!d) return;
    this.loading.set(true);
    this.findingDocumentService.deleteById(d.id).subscribe({
      next: (res) => {
        if (res.success) this.onRemoved.emit(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

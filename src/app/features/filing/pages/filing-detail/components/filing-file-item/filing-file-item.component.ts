import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FileItemComponent,
  FileResource,
} from "@/app/shared/components/file-item/file-item.component";
import { FilingFile } from "@/app/core/models/filing/filing.models";
import { FilingFileService } from "@/app/core/services/filing/filing-file.service";

@Component({
  selector: "app-filing-file-item",
  standalone: true,
  imports: [CommonModule, FileItemComponent],
  templateUrl: "./filing-file-item.component.html",
})
export class FilingFileItemComponent {
  private readonly service = inject(FilingFileService);

  filingFile = input<FilingFile | null>(null);
  filingId = input.required<number>();

  saved = output<FilingFile>();
  removed = output<FilingFile>();

  loading = signal(false);

  fileResource = computed((): FileResource | null => {
    const f = this.filingFile();
    if (!f) return null;
    return {
      id: f.id,
      bucketName: f.bucketName,
      fileName: f.fileName,
    };
  });

  onFileSelected(file: File): void {
    this.loading.set(true);
    this.service.create(this.filingId(), file).subscribe({
      next: (res) => {
        if (res.success && res.data) this.saved.emit(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onDeleteRequested(): void {
    const f = this.filingFile();
    if (!f) return;
    this.loading.set(true);
    this.service.delete(f.id).subscribe({
      next: (res) => {
        if (res.success) this.removed.emit(f);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

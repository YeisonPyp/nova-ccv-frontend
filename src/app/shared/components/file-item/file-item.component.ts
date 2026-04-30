import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { toObservable } from "@angular/core/rxjs-interop";
import { StorageService } from "../../../core/services/improvement-plan/storage.service";

export interface FileResource {
  id: number | string;
  bucketName: string;
  fileName: string;
  description?: string;
  createdAt?: string;
}

@Component({
  selector: "app-file-item",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./file-item.component.html",
})
export class FileItemComponent {
  private readonly storageService = inject(StorageService);

  file = input<FileResource | null>(null);
  label = input<string>("Archivo");
  accept = input<string>("image/*,.pdf");
  loading = input<boolean>(false);
  uploadProgress = input<number>(0);

  fileSelected = output<File>();
  deleteRequested = output<void>();

  resourceUrl = signal<string | null>(null);

  isNew = computed(() => this.file() === null);

  isImage = computed(() => {
    const name = this.file()?.fileName ?? "";
    return /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
  });

  fileExt = computed(() => {
    const name = this.file()?.fileName ?? "";
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
  });

  constructor() {
    toObservable(this.file).subscribe((f) => {
      if (f?.bucketName && f?.fileName) {
        this.storageService
          .downloadResource(f.bucketName, f.fileName)
          .subscribe((blob) => {
            const url = window.URL.createObjectURL(blob);
            this.resourceUrl.set(url);
          });
      } else {
        this.resourceUrl.set(null);
      }
    });
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fileSelected.emit(input.files[0]);
      input.value = "";
    }
  }

  viewFile(): void {
    const url = this.resourceUrl();
    if (url) window.open(url, "_blank");
  }

  requestDelete(): void {
    if (confirm("¿Eliminar este archivo?")) {
      this.deleteRequested.emit();
    }
  }
}

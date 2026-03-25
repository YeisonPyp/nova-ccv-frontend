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
  ReactiveFormsModule,
} from "@angular/forms";
import { HttpEventType } from "@angular/common/http";
import { EvidenceService } from "../../../../../../core/services/improvement-plan/evidence.service";
import { EvidenceDto } from "../../../../../../core/models/improvement-plan/evidence.model";
import { StorageService } from "../../../../../../core/services/improvement-plan/storage.service";
import { toObservable } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-evidence-item",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./evidence-item.component.html",
  styleUrls: ["./evidence-item.component.scss"],
})
export class EvidenceItemComponent {
  private readonly evidenceService = inject(EvidenceService);
  private readonly storageService = inject(StorageService);

  evidence = input<EvidenceDto | null>(null);
  actionId = input.required<number>();

  resourceUrl = signal<string | null>(null);

  isNew = computed(() => this.evidence() === null);

  onSaved = output<EvidenceDto>();
  onRemoved = output<EvidenceDto>();

  loading = signal(false);
  uploadProgress = signal(0);

  constructor() {
    toObservable(this.evidence).subscribe((e) => {
      if (e?.filePath && e.bucketName) {
        this.storageService.downloadResource(
          this.evidence()!.filePath!,
        ).subscribe((blob) => {
          const url = window.URL.createObjectURL(blob);
          this.resourceUrl.set(url);
        });
      }
    })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFileAndSave(input.files[0]);
    }
  }

  viewEvidence() {
    const url = this.evidence()?.url ?? this.resourceUrl();
    if (url) {
      window.open(url, "_blank");
    }
  }

  deleteEvidence() {
    if (!this.evidence()) return;

    if (confirm("¿Eliminar esta evidencia?")) {
      this.loading.set(true);
      this.evidenceService.deleteById(this.evidence()!.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.onRemoved.emit(res.data);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    }
  }

  private uploadFileAndSave(file: File) {
    const dto = {
      correctiveActionId: this.actionId(),
      file,
    };

    const prev = this.evidence();

    const obs = prev?.id ? this.evidenceService.update(prev.id, dto) : this.evidenceService.create(dto);
    obs.subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress.set(
            Math.round((100 * event.loaded) / (event.total ?? 1)),
          );
        } else if (event.type === HttpEventType.Response && event.body?.data) {
          this.onSaved.emit(event.body?.data);
        }
      },
      error: () => {
        this.loading.set(false);
        this.uploadProgress.set(0);
      },
    });
  }
}

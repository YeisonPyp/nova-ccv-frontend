import {
  Component,
  EventEmitter,
  inject,
  Input,
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
import { HttpEventType } from "@angular/common/http";
import { EvidenceService } from "../../../../../../core/services/improvement-plan/evidence.service";
import { CreateEvidenceDto, EvidenceDto } from "../../../../../../core/models/improvement-plan/evidence.model";
import { StorageService } from "../../../../../../core/services/improvement-plan/storage.service";

@Component({
  selector: "app-evidence-item",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./evidence-item.component.html",
  styleUrls: ["./evidence-item.component.scss"],
})
export class EvidenceItemComponent {
  private readonly fb = inject(FormBuilder);
  private readonly evidenceService = inject(EvidenceService);
  private readonly storageService = inject(StorageService);

  @Input() set evidence(val: EvidenceDto | null) {
    this._evidence.set(val);
    if (val) {
      this.isNew = false;
    }
  }

  @Input() actionId!: number;
  @Input() set isNew(val: boolean) {
    this._isNew.set(val);
  }

  @Output() onEvidenceChange = new EventEmitter<void>();

  _evidence = signal<EvidenceDto | null>(null);
  _isNew = signal(false);

  isEditing = signal(false);
  loading = signal(false);
  uploadProgress = signal(0);

  selectedFile: File | null = null;

  form: FormGroup = this.fb.group({
    type: ["DOCUMENT", Validators.required],
    description: [""],
    url: [""],
  });

  enableEdit() {
    this.isEditing.set(true);
    if (this._evidence()) {
      this.form.patchValue({
        type: this._evidence()!.type,
        description: this._evidence()!.description,
        url: this._evidence()!.url,
      });
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.selectedFile = null;
    this.form.reset({ type: "DOCUMENT" });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  viewEvidence() {
    if (this._evidence()?.bucketName && this._evidence()?.filePath) {
      const url = this.storageService.getDownloadUrl(
        this._evidence()!.bucketName!,
        this._evidence()!.filePath!,
      );
      window.open(url, "_blank");
    } else if (this._evidence()?.url) {
      window.open(this._evidence()!.url!, "_blank");
    }
  }

  deleteEvidence() {
    if (!this._evidence()) return;

    if (confirm("¿Eliminar esta evidencia?")) {
      this.loading.set(true);

      const fileToDelete = this._evidence()!.filePath;
      const bucketToDelete = this._evidence()!.bucketName;

      this.evidenceService.deleteById(this._evidence()!.id).subscribe({
        next: (res) => {
          if (res.success) {
            // Try clean file asynchronously
            if (bucketToDelete && fileToDelete) {
              this.storageService
                .deleteFile(bucketToDelete, fileToDelete)
                .subscribe();
            }

            this.onEvidenceChange.emit();
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    }
  }

  saveEvidence() {
    if (this.form.invalid) return;

    this.loading.set(true);

    if (this.selectedFile) {
      this.uploadFileAndSave();
    } else {
      this.saveRecordOnly();
    }
  }

  private uploadFileAndSave() {
    if (!this.selectedFile) return;

    const bucketName = "ccv";
    const objectName = `evidences/${this.actionId}/${Date.now()}_${this.selectedFile.name}`;

    this.storageService
      .uploadFile(bucketName, objectName, this.selectedFile)
      .subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress.set(
              Math.round((100 * event.loaded) / event.total),
            );
          } else if (event.type === HttpEventType.Response) {
            this.saveRecordOnly(bucketName, objectName);
          }
        },
        error: () => {
          this.loading.set(false);
          this.uploadProgress.set(0);
        },
      });
  }

  private saveRecordOnly(bucketName?: string, filePath?: string) {
    const dto: CreateEvidenceDto = {
      correctiveActionId: this.actionId,
      type: this.form.value.type,
      description: this.form.value.description,
      url: this.form.value.url,
      bucketName: bucketName,
      filePath: filePath,
    };

    if (this._isNew()) {
      this.evidenceService.create(dto).subscribe({
        next: (res) => {
          if (res.success) {
            this.cancelEdit();
            this.onEvidenceChange.emit();
          }
          this.loading.set(false);
          this.uploadProgress.set(0);
        },
        error: () => {
          this.loading.set(false);
          this.uploadProgress.set(0);
        },
      });
    } else {
      this.evidenceService.update(this._evidence()!.id, dto).subscribe({
        next: (res) => {
          if (res.success) {
            this.cancelEdit();
            this.onEvidenceChange.emit();
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    }
  }
}

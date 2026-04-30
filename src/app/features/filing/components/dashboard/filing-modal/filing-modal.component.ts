import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
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
import { toObservable } from "@angular/core/rxjs-interop";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
} from "rxjs";
import { FilingService } from "../../../../../core/services/filing/filing.service";
import { FilingProcessService } from "../../../../../core/services/filing/filing-process.service";
import { FilingFileService } from "../../../../../core/services/filing/filing-file.service";
import { AreaService } from "../../../../../core/services/assessment/area.service";
import { SearchSelectComponent } from "../../../../../shared/components/search-select/search-select.component";
import { FilingFileItemComponent } from "../../filing-file-item/filing-file-item.component";
import {
  Filing,
  FilingFile,
  FilingProcess,
} from "../../../../../core/models/filing/filing.models";
import { Area } from "../../../../../core/models/assessment/area.model";

@Component({
  selector: "app-filing-modal",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchSelectComponent,
    FilingFileItemComponent,
  ],
  templateUrl: "./filing-modal.component.html",
  styleUrl: "./filing-modal.component.scss",
})
export class FilingModalComponent {
  private readonly filingService = inject(FilingService);
  private readonly processService = inject(FilingProcessService);
  private readonly fileService = inject(FilingFileService);
  private readonly areaService = inject(AreaService);
  private readonly fb = inject(FormBuilder);

  isOpen = input(false);
  filing = input<Filing | null>(null);
  parentId = input<number | null>(null);

  onClose = output<void>();
  onSaved = output<Filing>();
  onUpdated = output<Filing>();

  processes = signal<FilingProcess[]>([]);
  files = signal<FilingFile[]>([]);
  saving = signal(false);

  isUpdateMode = computed(() => this.filing() !== null);

  searchSelectAreaContext = this.areaService.newSearchSelectAreaContext(
    (area: Area) => this.updateArea(area),
    { maxItems: 1, placeholder: "Buscar área...", label: "Área" },
  );

  form: FormGroup = this.fb.group({
    processName: [null, Validators.required],
    origin: ["", Validators.required],
    destination: ["", Validators.required],
  });

  constructor() {
    this.processService.findAll({ size: 100 }).subscribe((res) => {
      if (res.success && res.data) this.processes.set(res.data.content);
    });

    toObservable(this.filing)
      .pipe(
        switchMap((f) => {
          this.searchSelectAreaContext.clear();
          this.files.set([]);

          if (!f) {
            this.form.reset(
              { processName: null, origin: "", destination: "" },
              { emitEvent: false },
            );
            return of([]);
          }

          this.form.patchValue(
            {
              processName: f.processName,
              origin: f.origin ?? "",
              destination: f.destination ?? "",
            },
            { emitEvent: false },
          );

          if (f.areaId && f.areaName) {
            this.searchSelectAreaContext.selectResults([
              { id: f.areaId, name: f.areaName },
            ]);
          }

          this.form.valueChanges
            .pipe(
              debounceTime(800),
              filter(() => this.form.valid),
              distinctUntilChanged(
                (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
              ),
              switchMap((value) => this.filingService.update(f.id, value)),
            )
            .subscribe({
              next: (res) => {
                if (res.success && res.data) this.onUpdated.emit(res.data);
              },
            });

          return this.fileService.findByFilingId(f.id).pipe(
            map((res) => res.data ?? []),
            catchError(() => of([])),
          );
        }),
      )
      .subscribe((files) => this.files.set(files));
  }

  updateArea(area: Area): void {
    const f = this.filing();
    if (!f) return;
    this.filingService
      .update(f.id, { areaId: area.id })
      .subscribe((res) => {
        if (res.success && res.data) this.onUpdated.emit(res.data);
      });
  }

  onFileSaved(file: FilingFile): void {
    this.files.update((files) => [...files, file]);
  }

  onFileRemoved(file: FilingFile): void {
    this.files.update((files) => files.filter((f) => f.id !== file.id));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const area = this.searchSelectAreaContext.selectedOptions()[0];
    const dto = {
      ...this.form.value,
      areaId: area ? Number(area.id) : undefined,
      parentId: this.parentId() ?? undefined,
    };
    this.filingService.create(dto).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.onSaved.emit(res.data);
          this.onClose.emit();
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  close(): void {
    this.onClose.emit();
  }
}

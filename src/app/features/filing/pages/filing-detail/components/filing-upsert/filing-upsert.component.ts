import { CommonModule } from "@angular/common";
import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  output,
  input,
} from "@angular/core";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { debounceTime, filter, distinctUntilChanged, switchMap } from "rxjs";
import { Area } from "@/app/core/models/assessment/area.model";
import {
  Filing,
  FilingProcess,
  FilingFile,
} from "@/app/core/models/filing/filing.models";
import { AreaService } from "@/app/core/services/assessment/area.service";
import { FilingProcessService } from "@/app/core/services/filing/filing-process.service";
import { FilingService } from "@/app/core/services/filing/filing.service";
import { SearchSelectComponent } from "@/app/shared/components/search-select/search-select.component";
import { FilingFileItemComponent } from "../filing-file-item/filing-file-item.component";
import { FilingWorkflowsComponent } from "../filing-workflows/filing-workflows.component";

@Component({
  selector: "app-filing-upsert",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchSelectComponent,
    FilingFileItemComponent,
    FilingWorkflowsComponent,
  ],
  templateUrl: "./filing-upsert.component.html",
  styleUrl: "./filing-upsert.component.scss",
})
export class FilingUpsertComponent implements OnInit {
  private readonly filingService = inject(FilingService);
  private readonly processService = inject(FilingProcessService);
  private readonly areaService = inject(AreaService);
  private readonly fb = inject(FormBuilder);

  id = input.required<number | null>();

  filing = signal<Filing | null>(null);
  parentId = signal<number | null>(null);

  processes = signal<FilingProcess[]>([]);
  saving = signal(false);

  isUpdateMode = computed(() => this.filing() !== null);

  onSaveFiling = output<Filing>();
  onCancel = output<void>();

  searchSelectAreaContext = this.areaService.newSearchSelectAreaContext(
    (area: Area) => this.updateArea(area),
    { maxItems: 1, placeholder: "Buscar área...", label: "Área" },
  );

  form: FormGroup = this.fb.group({
    processName: [null, Validators.required],
  });

  constructor() {
    this.processService.findAll({ size: 100 }).subscribe((res) => {
      if (res.success && res.data) this.processes.set(res.data.content);
    });

    effect(() => {
      const f = this.filing();
      this.searchSelectAreaContext.clear();

      if (!f) {
        this.form.reset(
          { processName: null, origin: "", destination: "" },
          { emitEvent: false },
        );
        return;
      }

      this.form.patchValue(
        {
          processName: f.processName,
        },
        { emitEvent: false },
      );

      if (f.areaId && f.areaName) {
        this.searchSelectAreaContext.selectResults([
          { id: f.areaId, name: f.areaName },
        ]);
      }
    });
  }

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.filingService.findById(id).subscribe((res) => {
        if (res.success && res.data) {
          this.filing.set(res.data);
          this.form.valueChanges
            .pipe(
              debounceTime(800),
              filter(() => this.form.valid),
              distinctUntilChanged(
                (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
              ),
              switchMap((value) => this.filingService.update(+id, value)),
            )
            .subscribe({
              next: (res) => {
                if (res.success && res.data) this.filing.set(res.data);
              },
            });
        }
      });
    }
  }

  updateArea(area: Area): void {
    const f = this.filing();
    if (!f) return;
    this.filingService.update(f.id, { areaId: area.id }).subscribe((res) => {
      if (res.success && res.data) this.filing.set(res.data);
    });
  }

  onFileSaved(file: FilingFile): void {
    const f = this.filing();
    if (!f) {
      return;
    }

    this.filing.set({ ...f, files: [...f.files, file] });
  }

  onFileRemoved(file: FilingFile): void {
    const f = this.filing();
    if (!f) {
      return;
    }
    this.filing.set({ ...f, files: f.files.filter((f) => f.id !== file.id) });
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
          this.onSaveFiling.emit(res.data);
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  getFiles() {
    return this.filing()?.files ?? [];
  }
}

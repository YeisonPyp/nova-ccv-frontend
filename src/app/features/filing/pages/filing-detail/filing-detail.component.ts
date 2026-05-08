import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
} from "rxjs";
import { FilingService } from "../../../../core/services/filing/filing.service";
import { FilingProcessService } from "../../../../core/services/filing/filing-process.service";
import { FilingFileService } from "../../../../core/services/filing/filing-file.service";
import { AreaService } from "../../../../core/services/assessment/area.service";
import { SearchSelectComponent } from "../../../../shared/components/search-select/search-select.component";
import { FilingFileItemComponent } from "./components/filing-file-item/filing-file-item.component";
import { FilingWorkflowsComponent } from "./components/filing-workflows/filing-workflows.component";
import {
  Filing,
  FilingFile,
  FilingProcess,
} from "../../../../core/models/filing/filing.models";
import { Area } from "../../../../core/models/assessment/area.model";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-filing-modal",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchSelectComponent,
    FilingFileItemComponent,
    FilingWorkflowsComponent,
  ],
  templateUrl: "./filing-detail.component.html",
  styleUrl: "./filing-detail.component.scss",
})
export class FilingModalComponent implements OnInit {
  private readonly filingService = inject(FilingService);
  private readonly processService = inject(FilingProcessService);
  private readonly fileService = inject(FilingFileService);
  private readonly areaService = inject(AreaService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  filing = signal<Filing | null>(null);
  parentId = signal<number | null>(null);

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

    effect(() => {
      const f = this.filing();
      this.searchSelectAreaContext.clear();
      this.files.set([]);

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

      this.fileService
        .findByFilingId(f.id)
        .pipe(
          map((res) => res.data ?? []),
          catchError(() => of([])),
        )
        .subscribe((files) => this.files.set(files));
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    const parentIdParam = this.route.snapshot.queryParamMap.get("parentId");
    this.parentId.set(parentIdParam ? +parentIdParam : null);

    if (id) {
      this.filingService.findById(+id).subscribe((res) => {
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
          this.goBack();
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(["/filings/dashboard"]);
  }
}

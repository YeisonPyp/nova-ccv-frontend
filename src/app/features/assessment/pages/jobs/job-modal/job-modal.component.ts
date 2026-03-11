import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
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
  CreatePositionDto,
  UpdatePositionDto,
} from "../../../../../core/services/assessment/position.service";
import { AreaService } from "../../../../../core/services/assessment/area.service";
import {
  CompetencieService,
} from "../../../../../core/services/assessment/competencie.service";
import { Area } from "../../../../../core/models/assessment/area.model";
import { Position } from "../../../../../core/models/assessment/position.model";
import { SearchSelectComponent } from "../../../../../shared/components/search-select/search-select.component";
import { SearchSelectOption } from "../../../../../shared/components/search-select/on-search-select.interface";

@Component({
  selector: "app-job-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./job-modal.component.html",
  styleUrls: [
    "../../dashboard/create-assessment-modal/create-assessment-modal.component.scss",
  ],
})
export class JobModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() jobData: Position | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveJob = new EventEmitter<CreatePositionDto | UpdatePositionDto>();

  form: FormGroup;
  areas = signal<Area[]>([]);

  competencies = signal<SearchSelectOption[]>([]);
  selectedCompetencies = signal<SearchSelectOption[]>([]);

  selectedAreas = signal<SearchSelectOption[]>([]);

  private areaService = inject(AreaService);
  private competencieService = inject(CompetencieService);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ["", [Validators.required]],
      description: ["", [Validators.required]],
      areaId: [null, [Validators.required]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.form.reset();
    }
    if (changes["jobData"] && this.jobData && this.isOpen) {
      console.log(this.jobData);
      this.form.patchValue({
        name: this.jobData.name || "",
        description: this.jobData.description || "",
        areaId: this.jobData.areaId || null,
        competencies: this.jobData.competencies || [],
      });
      if (this.jobData.areaName) {
        this.selectedAreas.set([
          { id: this.jobData.areaId, title: this.jobData.areaName },
        ]);
      }

      if (this.jobData.competencies?.length) {
        this.selectedCompetencies.set(this.jobData.competencies.map((i) => ({ id: i.id, title: i.name })));
      }
    }
  }

  onClose() {
    this.closeModal.emit();
    this.selectedAreas.set([]);
    this.selectedCompetencies.set([]);
  }

  onSearchArea(s: string) {
    this.areaService.findAreas({ name: s }).subscribe((res) => {
      if (res.data && res.data.content) this.areas.set(res.data.content);
    });
  }

  onSelectArea(i: SearchSelectOption) {
    console.log('selected area', i);
    this.form.patchValue({ areaId: i.id });
    this.selectedAreas.set([i]);
  }

  onRemoveArea(i: SearchSelectOption) {
    this.form.patchValue({ areaId: null });
    this.selectedAreas.set([]);
  }

  onSearchCompetencie(q: string) {
    this.competencieService.getCompetencies({ name: q, size: 10 }).subscribe((r) => {
      if (r.success && r.data) {
        this.competencies.set(r.data.content.map((e) => ({ id: e.id, title: e.name })));
      }
    });
  }

  onSelectCompetencie(o: SearchSelectOption) {
    const record = this.selectedCompetencies().reduce((prev, curr) => {
      prev[curr.id]= curr;
      return prev;
    }, {} as Record<string, SearchSelectOption>);
    record[o.id] = o;
    this.selectedCompetencies.set(Object.values(record));
  }

  onRemoveCompetencie(o: SearchSelectOption) {
    this.selectedCompetencies.set(this.selectedCompetencies().filter((i) => i.id !== o.id));
  }

  get areaOptions(): Array<SearchSelectOption> {
    return this.areas().map((area) => ({
      id: area.id,
      title: area.name,
    }));
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const payload = {
        name: formValue.name,
        description: formValue.description,
        areaId: formValue.areaId,
        competencies: this.selectedCompetencies().reduce((prev, { id }) => {
          prev.push(Number(id));
          return prev;
        }, [] as Array<number>),
      };
      this.saveJob.emit(payload);
    } else {
      this.form.markAllAsTouched();
    }
  }
}

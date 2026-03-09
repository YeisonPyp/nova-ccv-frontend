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
  CreateRuleDto,
  UpdateRuleDto,
} from "../../../../../../core/services/assessment/impact-rule.service";
import { CompetencieService } from "../../../../../../core/services/assessment/competencie.service";
import { SearchSelectComponent } from "../../../../../../shared/components/search-select/search-select.component";
import { SearchSelectOption } from "../../../../../../shared/components/search-select/on-search-select.interface";
import { ImpactRule } from "../../../../../../core/models/assessment/impact-rule.model";

@Component({
  selector: "app-impact-rule-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./impact-rule-modal.component.html",
  styleUrls: [
    "../../../dashboard/create-assessment-modal/create-assessment-modal.component.scss",
  ],
})
export class ImpactRuleModalComponent implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() ruleData: ImpactRule | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveRules = new EventEmitter<CreateRuleDto | UpdateRuleDto>();

  form: FormGroup;

  private competencieService = inject(CompetencieService);

  competencyItems = signal<SearchSelectOption[]>([]);

  selectedCompetencies = signal<SearchSelectOption[]>([]);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ["", [Validators.required]],
      impactFactor: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.searchCompetencies("");
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.form.reset();
      this.selectedCompetencies.set([]);
    }
    if (changes["ruleData"] && this.ruleData && this.isOpen) {
      this.form.patchValue({
        name: this.ruleData.name || "",
        impactFactor: this.ruleData.impactFactor || null,
      });
      this.selectedCompetencies.set(this.ruleData.competencies?.map((c) => ({id: c.id, title: c.name})) ?? [])
    }
  }

  searchCompetencies(term: string) {
    this.competencieService
      .getCompetencies({ page: 1, size: 50, name: term })
      .subscribe((res) => {
        if (res.data && res.data.content) {
          const options = res.data.content.map((c) => ({
            id: c.id,
            title: c.name,
          }));
          this.competencyItems.set(options);
        }
      });
  }

  onSelectCompetency(option: SearchSelectOption) {
    const result = this.selectedCompetencies().reduce((prev, curr) => {
      prev[curr.id] = curr;
      return prev;
    }, {} as Record<string | number, SearchSelectOption>);
    result[option.id] = option;
    this.selectedCompetencies.set(Object.values(result));
  }

  onRemoveCompetency(option: SearchSelectOption) {
    this.selectedCompetencies.set(this.selectedCompetencies().filter((i) => i.id !== option.id));
  }

  getSelectedCompetencies(): number[] {
    const ids = new Set<number>();
    this.selectedCompetencies().forEach((opt) => {
      if (opt && opt.id) {
        ids.add(Number(opt.id));
      }
    });
    return Array.from(ids);
  }

  onClose() {
    this.closeModal.emit();
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const compIds = this.getSelectedCompetencies();
      const dto: UpdateRuleDto = {};
      Object.assign(formValue, dto);
      dto.competencieIds = compIds;
      this.saveRules.emit(dto);
    } else {
      this.form.markAllAsTouched();
    }
  }
}

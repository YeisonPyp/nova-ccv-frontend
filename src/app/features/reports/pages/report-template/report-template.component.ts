import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ReportVariableComponent } from './report-variable/report-variable.component';
import { ReportTemplate } from '@/app/core/models/reports/report-template.model';
import { ReportTemplateService } from '@/app/core/services/reports/report-template.service';
import { GoalOption } from '@/app/core/models/goals/goal-option.model';
import { ReportsListComponent } from '../../components/reports-list.component';
import { ReportService } from '@/app/core/services/reports/report.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldErrorDirective } from '@/app/shared/directives/form-field-error.directive';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ReportTemplateVariable } from '@/app/core/models/reports/report-template-variable.model';

interface VariableOptionSelected {
  [variableId: number]: string | null;
}

type TabKey = 'create' | 'reports';

interface Tab {
  key: TabKey;
  label: string;
}

@Component({
  selector: 'app-report-template',
  templateUrl: './report-template.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReportVariableComponent,
    ReportsListComponent,
    ReactiveFormsModule,
    FormFieldErrorDirective,
    LoadingSpinnerComponent,
  ],
})
export class ReportTemplateComponent {
  private readonly service = inject(ReportTemplateService);
  private readonly reportService = inject(ReportService);
  private readonly fb = inject(FormBuilder);

  templateId = input.required<number>();

  template = signal<ReportTemplate | null>(null);
  isLoading = signal(false);
  variables = signal<ReportTemplateVariable[]>([]);

  tabs: Tab[] = [
    { key: 'create', label: 'Nuevo informe' },
    { key: 'reports', label: 'Informes Relacionados' },
  ];

  activeTab = signal<TabKey>('create');

  variableMap = signal<VariableOptionSelected>({});

  form = this.fb.group({
    reportName: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      this.service.findById(this.templateId()).subscribe((res) => {
        this.template.set(res.data);
        this.variables.set(res.data.variables || []);
        this.isLoading.set(false);
      });
    });
  }

  canSubmit = computed(() =>
    this.variables().length === 0
      ? true
      : this.variables().every((v) => this.variableMap()[v.id]),
  );

  selectedCount = computed(
    () => this.variables().filter((v) => this.variableMap()[v.id]).length,
  );

  progress = computed(() => {
    const total = this.variables().length;
    return total === 0 ? 0 : (this.selectedCount() / total) * 100;
  });

  onSelectOption(variableId: number, o: GoalOption) {
    this.variableMap.update((prev) => {
      prev[variableId] = o.value;
      return { ...prev };
    });
  }

  onNoOptions(id: number) {
    this.variables.set(this.variables().filter((v) => v.id !== id));
  }

  clearVariable(variableId: number) {
    this.variableMap.update((prev) => {
      delete prev[variableId];
      return { ...prev };
    });
  }

  submit() {
    this.reportService
      .create({
        reportName: this.form.value.reportName!,
        templateId: this.template()!.id,
        vars: this.variableMap(),
      })
      .subscribe((res) => {
        console.log(res.data);
      });
  }
}

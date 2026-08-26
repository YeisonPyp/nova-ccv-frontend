import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AssessmentConfigService,
  AssessmentConfig,
} from '@/app/core/services/assessment/assessment-config.service';

type IntervalUnit = 'days' | 'weeks' | 'months' | 'years';

interface IntervalParts {
  amount: number;
  unit: IntervalUnit;
}

@Component({
  selector: 'app-assessment-config-param',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-config-param.component.html',
})
export class AssessmentConfigParamComponent {
  private readonly service = inject(AssessmentConfigService);

  readonly units: { value: IntervalUnit; label: string }[] = [
    { value: 'days', label: 'Días' },
    { value: 'weeks', label: 'Semanas' },
    { value: 'months', label: 'Meses' },
    { value: 'years', label: 'Años' },
  ];

  config = signal<AssessmentConfig | null>(null);
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);

  evaluation = signal<IntervalParts>({ amount: 7, unit: 'days' });
  periodCreation = signal<IntervalParts>({ amount: 1, unit: 'years' });

  constructor() {
    this.service.get().subscribe({
      next: (res) => {
        this.config.set(res.data);
        this.evaluation.set(this.parse(res.data.evaluationWindow));
        this.periodCreation.set(this.parse(res.data.periodCreationInterval));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private parse(value: string | null | undefined): IntervalParts {
    if (!value) return { amount: 1, unit: 'days' };
    // Postgres verbose interval, e.g. "7 days", "1 mon", "1 year"
    const match = value.match(
      /(\d+)\s*(day|days|week|weeks|mon|mons|month|months|year|years)/i,
    );
    if (!match) return { amount: 1, unit: 'days' };
    const amount = Number(match[1]);
    const raw = match[2].toLowerCase();
    let unit: IntervalUnit = 'days';
    if (raw.startsWith('week')) unit = 'weeks';
    else if (raw.startsWith('mon')) unit = 'months';
    else if (raw.startsWith('year')) unit = 'years';
    return { amount, unit };
  }

  private compose(parts: IntervalParts): string {
    const amount = Math.max(1, Math.floor(parts.amount || 1));
    return `${amount} ${parts.unit}`;
  }

  setEvaluationAmount(v: number) {
    this.evaluation.update((p) => ({ ...p, amount: v }));
  }
  setEvaluationUnit(v: IntervalUnit) {
    this.evaluation.update((p) => ({ ...p, unit: v }));
  }
  setPeriodAmount(v: number) {
    this.periodCreation.update((p) => ({ ...p, amount: v }));
  }
  setPeriodUnit(v: IntervalUnit) {
    this.periodCreation.update((p) => ({ ...p, unit: v }));
  }

  save() {
    if (this.saving()) return;
    this.saving.set(true);
    this.saved.set(false);
    this.service
      .update({
        evaluationWindow: this.compose(this.evaluation()),
        periodCreationInterval: this.compose(this.periodCreation()),
      })
      .subscribe({
        next: (res) => {
          this.config.set(res.data);
          this.saving.set(false);
          this.saved.set(true);
        },
        error: () => this.saving.set(false),
      });
  }
}

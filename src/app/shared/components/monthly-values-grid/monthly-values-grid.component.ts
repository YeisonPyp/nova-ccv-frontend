import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

const MONTH_LABELS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export interface MonthlyValue {
  month: number;
  value: number | null;
}

@Component({
  selector: 'app-monthly-values-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-values-grid.component.html',
})
export class MonthlyValuesGridComponent {
  readonly title = input<string>('');
  readonly values = input.required<MonthlyValue[]>();
  readonly disabled = input<boolean>(false);
  readonly referenceLabel = input<string>('Planeado');
  readonly referenceValues = input<MonthlyValue[]>([]);

  readonly save = output<{ month: number; value: number }>();

  readonly monthLabels = MONTH_LABELS;

  valueFor(month: number): number | null {
    return this.values().find((v) => v.month === month)?.value ?? null;
  }

  referenceValueFor(month: number): number | null {
    return this.referenceValues().find((v) => v.month === month)?.value ?? null;
  }

  onBlur(month: number, raw: string): void {
    if (raw === '' || raw == null) return;
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    this.save.emit({ month, value });
  }
}

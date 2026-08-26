import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { CurrencyFormatDirective } from '@/app/shared/directives/currency-format.directive';
import { FormFieldErrorDirective } from '@/app/shared/directives/form-field-error.directive';

@Component({
  selector: 'app-monthly-metric-row',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyFormatDirective,
    FormFieldErrorDirective,
  ],
  templateUrl: './monthly-metric-row.component.html',
})
export class MonthlyMetricRowComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  label = input.required<string>();
  value = input<number | null>(null);
  referenceValue = input<number | null>(null);
  referenceLabel = input<string>('Planeado');
  targetValue = input<number | null>(null);
  targetLabel = input<string>('Meta');
  currency = input<boolean>(false);
  disabled = input<boolean>(false);

  save = output<number>();

  formGroup = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      this.formGroup.patchValue(
        { amount: this.value() ?? 0 },
        { emitEvent: false },
      );
      if (this.disabled()) {
        this.formGroup.disable({ emitEvent: false });
      } else {
        this.formGroup.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.formGroup.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged((prev, curr) => prev.amount === curr.amount),
        filter(() => this.formGroup.valid),
      )
      .subscribe((values) => {
        if (values?.amount != null) {
          this.save.emit(Number(values.amount));
        }
      });
  }
}

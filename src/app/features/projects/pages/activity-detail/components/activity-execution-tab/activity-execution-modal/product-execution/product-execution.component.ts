import {
  ActivityProductExecution,
  ActivityProductMatrixRow,
  PatActivityExecutionService,
} from '@/app/core/services/pat/pat-activity-execution.service';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';

/**
 * Per-product monthly execution input. Mirrors the budget execution component:
 * autosaves the contribution on change.
 */
@Component({
  selector: 'app-product-execution',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-execution.component.html',
})
export class ProductExecutionComponent implements OnInit {
  private readonly service = inject(PatActivityExecutionService);
  private readonly fb = inject(FormBuilder);

  row = input.required<ActivityProductMatrixRow>();
  activityId = input.required<number>();
  month = input.required<number>();
  onSave = output<ActivityProductExecution>();

  form = this.fb.group({
    contribution: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      const row = this.row();
      this.form.patchValue(
        { contribution: row.contribution ?? 0 },
        { emitEvent: false },
      );
    });
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter(() => this.form.valid),
        debounceTime(700),
      )
      .subscribe((value) => {
        this.form.markAllAsTouched();
        this.service
          .saveProductExecution({
            activityId: this.activityId(),
            month: this.month(),
            productId: this.row().productId,
            contribution: value.contribution ?? 0,
          })
          .subscribe((res) => this.onSave.emit(res.data));
      });
  }
}

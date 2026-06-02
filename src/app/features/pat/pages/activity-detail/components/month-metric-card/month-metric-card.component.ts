import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";

export interface MonthCardMetric {
  label: string;
  value: number;
  isCurrency?: boolean;
}

@Component({
  selector: "app-month-metric-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="bg-background rounded-xl border border-border-primary shadow-sm p-4 text-left hover:border-primary transition-colors flex flex-col gap-2 cursor-pointer w-full"
      (click)="cardClick.emit()"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-secondary">
          {{ label() }}
        </span>
        @if (registered()) {
          <span
            class="inline-block px-2 py-0.5 rounded-full text-[0.6rem] font-semibold bg-primary/10 text-primary uppercase tracking-wider"
          >
            {{ registeredLabel() }}
          </span>
        } @else {
          <span
            class="inline-block px-2 py-0.5 rounded-full text-[0.6rem] font-semibold bg-gray-100 text-tertiary uppercase tracking-wider"
          >
            {{ pendingLabel() }}
          </span>
        }
      </div>

      <div class="grid grid-cols-2 gap-2 mt-1">
        @for (m of metrics(); track m.label) {
          <div class="flex flex-col gap-0.5">
            <span
              class="text-[0.6rem] font-semibold text-tertiary uppercase tracking-widest"
            >
              {{ m.label }}
            </span>
            <span class="text-sm font-semibold text-secondary">
              @if (m.isCurrency) {
                {{ m.value | currency }}
              } @else {
                {{ m.value }}
              }
            </span>
          </div>
        }
      </div>
    </button>
  `,
})
export class MonthMetricCardComponent {
  readonly label = input.required<string>();
  readonly registered = input<boolean>(false);
  readonly metrics = input.required<MonthCardMetric[]>();
  readonly registeredLabel = input<string>("Registrado");
  readonly pendingLabel = input<string>("Pendiente");

  readonly cardClick = output<void>();
}

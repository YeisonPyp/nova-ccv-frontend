// pat/components/strategic-goals-panel/strategic-goals-panel.component.ts
import {
  Component, OnInit, input, output, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PatApiService } from '../../../../core/services/pat-api.service';
import {
  StrategicGoal, GoalLink, GoalLinkType, PerformanceIndicator
} from '../../models/pat.models';
import { PatProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-strategic-goals-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PatProgressBarComponent],
  templateUrl: './strategic-goals-panel.component.html',
  styleUrl: './strategic-goals-panel.component.scss',
})
export class StrategicGoalsPanelComponent implements OnInit {
  programId  = input.required<number>();
  readonly   = input<boolean>(false);
  goalsLinked = output<number>();

  private readonly patApi = inject(PatApiService);
  private readonly fb     = inject(FormBuilder);

  linkedGoals      = signal<GoalLink[]>([]);
  availableGoals   = signal<StrategicGoal[]>([]);
  indicators       = signal<PerformanceIndicator[]>([]);
  loading          = signal(true);
  showLinkForm     = signal(false);
  showIndicatorForm = signal(false);
  submitting       = signal(false);
  error            = signal<string | null>(null);

  linkTypes: { value: GoalLinkType; label: string }[] = [
    { value: 'OBJECTIVE',   label: 'Objetivo Estratégico' },
    { value: 'PROJECT',     label: 'Proyecto'             },
    { value: 'SUBACTIVITY', label: 'Subactividad'         },
  ];

  linkForm = this.fb.group({
    strategicGoalId: [null as number | null, Validators.required],
    linkType:        ['OBJECTIVE' as GoalLinkType, Validators.required],
    weight:          [100, [Validators.required, Validators.min(1), Validators.max(100)]],
  });

  indicatorForm = this.fb.group({
    code:        ['', [Validators.required, Validators.maxLength(20)]],
    name:        ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    type:        ['PERCENTAGE', Validators.required],
    unit:        ['%', Validators.required],
    baseline:    [0, [Validators.required, Validators.min(0)]],
    target:      [100, [Validators.required, Validators.min(0)]],
    weight:      [100, [Validators.required, Validators.min(1), Validators.max(100)]],
  });

  totalWeight = computed(() =>
    this.linkedGoals().reduce((s, g) => s + g.weight, 0)
  );

  weightValid = computed(() => this.totalWeight() <= 100);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    const id = this.programId();

    this.patApi.getGoalLinks(id).subscribe(links => {
      this.linkedGoals.set(links);
      this.goalsLinked.emit(links.length);
    });

    this.patApi.getStrategicGoals().subscribe(goals => {
      this.availableGoals.set(goals);
    });

    this.patApi.getIndicatorsByProgram(id).subscribe(indicators => {
      this.indicators.set(indicators);
      this.loading.set(false);
    });
  }

  toggleLinkForm(): void {
    this.showLinkForm.update(v => !v);
    this.linkForm.reset({ linkType: 'OBJECTIVE', weight: 100 });
    this.error.set(null);
  }

  toggleIndicatorForm(): void {
    this.showIndicatorForm.update(v => !v);
    this.indicatorForm.reset({ type: 'PERCENTAGE', unit: '%', baseline: 0, target: 100, weight: 100 });
    this.error.set(null);
  }

  submitLink(): void {
    if (this.linkForm.invalid) {
      this.linkForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const v = this.linkForm.value;

    this.patApi.createGoalLink({
      strategicGoalId: v.strategicGoalId!,
      linkType:        v.linkType!,
      weight:          v.weight!,
      programId:       this.programId(),
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showLinkForm.set(false);
        this.loadData();
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Error al vincular meta');
        this.submitting.set(false);
      },
    });
  }

  submitIndicator(): void {
    if (this.indicatorForm.invalid) {
      this.indicatorForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const v = this.indicatorForm.value;

    this.patApi.createIndicator({
      ...v,
      programId: this.programId(),
      areaId:    0, // resolved by backend via program
      year:      new Date().getFullYear(),
    } as any).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showIndicatorForm.set(false);
        this.loadData();
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Error al crear indicador');
        this.submitting.set(false);
      },
    });
  }

  removeLink(linkId: number): void {
    this.patApi.deleteGoalLink(linkId).subscribe(() => this.loadData());
  }

  getGoalName(goalId: number): string {
    return this.availableGoals().find(g => g.id === goalId)?.name ?? `Meta #${goalId}`;
  }

  getAchievedPct(indicator: PerformanceIndicator): number {
    const range = indicator.target - indicator.baseline;
    if (range <= 0) return 100;
    return Math.round(((indicator.currentValue - indicator.baseline) / range) * 100);
  }
}
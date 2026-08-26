import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { TrainingProgramService } from '@/app/core/services/training/training-program.service';
import { TrainingProgramDetail } from '@/app/core/models/training/training-program.models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ProgramEmployeesComponent } from '../../components/program-employees/program-employees.component';
import { ProgramSurveysComponent } from '../../components/program-surveys/program-surveys.component';
import { ProgramTrainingsComponent } from '../../components/program-trainings/program-trainings.component';
import { ProgramMetricsComponent } from '../../components/program-metrics/program-metrics.component';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ProgramEmployeesComponent,
    ProgramSurveysComponent,
    ProgramTrainingsComponent,
    ProgramMetricsComponent,
  ],
  templateUrl: './program-detail.component.html',
})
export class ProgramDetailComponent {
  private readonly router = inject(Router);
  private readonly service = inject(TrainingProgramService);

  programId = input.required<number>();

  detail = signal<TrainingProgramDetail | null>(null);
  loading = signal(false);

  activeTab = signal<'employees' | 'surveys' | 'trainings'>('trainings');

  readonly weekDayLabels = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  constructor() {
    effect(() => {
      this.load(this.programId());
    });
  }

  load(id: number) {
    this.loading.set(true);
    this.service.getDetail(id).subscribe({
      next: (res) => {
        this.detail.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatMinutes(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  weekDayLabel(v: number): string {
    return this.weekDayLabels[v - 1] ?? String(v);
  }

  goBack() {
    this.router.navigate(['/training/programs']);
  }
}

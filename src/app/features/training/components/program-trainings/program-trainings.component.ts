import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TrainingProgramService } from '@/app/core/services/training/training-program.service';
import { ProgramMetrics } from '@/app/core/models/training/training-program.models';

@Component({
  selector: 'app-program-trainings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './program-trainings.component.html',
})
export class ProgramTrainingsComponent {
  private readonly service = inject(TrainingProgramService);

  programId = input.required<number>();

  metrics = signal<ProgramMetrics | null>(null);
  loading = signal(false);
  generating = signal(false);

  constructor() {
    effect(() => {
      this.load(this.programId());
    });
  }

  load(id: number) {
    this.loading.set(true);
    this.service.getMetrics(id).subscribe({
      next: (res) => {
        this.metrics.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  generate() {
    if (this.generating()) return;
    this.generating.set(true);
    this.service.generate(this.programId()).subscribe({
      next: (res) => {
        this.generating.set(false);
        if (res.success) {
          alert(`Se generaron ${res.data} capacitaciones`);
          this.load(this.programId());
        }
      },
      error: (err) => {
        this.generating.set(false);
        alert(err?.error?.message ?? 'No se pudieron generar las capacitaciones');
      },
    });
  }
}

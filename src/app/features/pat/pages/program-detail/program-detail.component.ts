import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PatProgramService } from '@/app/core/services/pat/pat-program.service';
import {
  PatStrategicProgram,
  PatStrategicProgramBenefitQuarterly,
  PatStrategicProgramBudgetLine,
} from '@/app/core/models/pat/pat-models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { CreatePatProgramComponent } from '../../components/programs-tab/create-program/create-program.component';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, CreatePatProgramComponent],
  templateUrl: './program-detail.component.html',
})
export class ProgramDetailComponent {
  private readonly service = inject(PatProgramService);
  private readonly router = inject(Router);

  year = input.required<number>();
  id = input.required<number>();

  loading = signal(false);
  program = signal<PatStrategicProgram | null>(null);
  budgetLines = signal<PatStrategicProgramBudgetLine[]>([]);
  benefits = signal<PatStrategicProgramBenefitQuarterly[]>([]);

  editModalOpen = signal(false);

  constructor() {
    effect(() => {
      this.load(this.id());
    });
  }

  load(id: number): void {
    this.loading.set(true);
    this.service.findDetail(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.program.set(res.data.program);
          this.budgetLines.set(res.data.budgetLines);
          this.benefits.set(res.data.benefits);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openEdit(): void {
    this.editModalOpen.set(true);
  }

  closeEdit(): void {
    this.editModalOpen.set(false);
  }

  onSaved(): void {
    this.closeEdit();
    this.load(this.id());
  }

  back(): void {
    this.router.navigate(['/pat', this.year(), 'dashboard']);
  }

  totalBudgeted(): number {
    return this.budgetLines().reduce((s, l) => s + (l.budgetedAmount ?? 0), 0);
  }

  totalExecuted(): number {
    return this.budgetLines().reduce(
      (s, l) =>
        s + (l.q1Executed ?? 0) + (l.q2Executed ?? 0) + (l.q3Executed ?? 0) + (l.q4Executed ?? 0),
      0,
    );
  }

  money(v: number | null | undefined): string {
    return (v ?? 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }
}

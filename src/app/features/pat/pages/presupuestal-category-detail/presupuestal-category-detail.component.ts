import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CategoryIn,
  CategoryOut,
  CreateCategoryMovementDto,
  PatPresupuestalCategoryService,
  PresupuestalCategory,
} from '@/app/core/services/pat/pat-presupuestal-category.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { Observable } from 'rxjs';

type MovementKind = 'in' | 'out';

@Component({
  selector: 'app-presupuestal-category-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './presupuestal-category-detail.component.html',
})
export class PresupuestalCategoryDetailComponent {
  private readonly service = inject(PatPresupuestalCategoryService);
  private readonly router = inject(Router);

  id = input.required<number>();

  loading = signal(false);
  category = signal<PresupuestalCategory | null>(null);
  ins = signal<CategoryIn[]>([]);
  outs = signal<CategoryOut[]>([]);

  // create-movement modal
  modalKind = signal<MovementKind | null>(null);
  amount = signal<number | null>(null);
  description = signal('');
  saving = signal(false);

  constructor() {
    effect(() => {
      this.load(this.id());
    });
  }

  load(id: number) {
    this.loading.set(true);
    this.service.findById(id).subscribe({
      next: (res) => {
        this.category.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.loadMovements(id);
  }

  loadMovements(id: number) {
    this.service.findIns(id).subscribe((res) => this.ins.set(res.data ?? []));
    this.service.findOuts(id).subscribe((res) => this.outs.set(res.data ?? []));
  }

  money(v: number | null | undefined): string {
    return (v ?? 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }

  openMovement(kind: MovementKind) {
    this.amount.set(null);
    this.description.set('');
    this.modalKind.set(kind);
  }

  closeMovement() {
    this.modalKind.set(null);
  }

  submitMovement() {
    const kind = this.modalKind();
    const amount = this.amount();
    if (!kind || !amount || amount <= 0 || this.saving()) return;
    const dto: CreateCategoryMovementDto = {
      amount,
      description: this.description() || undefined,
    };
    this.saving.set(true);
    const req: Observable<unknown> =
      kind === 'in'
        ? this.service.createIn(this.id(), dto)
        : this.service.createOut(this.id(), dto);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeMovement();
        this.load(this.id());
      },
      error: () => this.saving.set(false),
    });
  }

  deleteIn(m: CategoryIn) {
    if (!confirm('¿Eliminar este ingreso?')) return;
    this.service.deleteIn(this.id(), m.id).subscribe((res) => {
      if (res.success) this.load(this.id());
    });
  }

  deleteOut(out: CategoryOut) {
    if (out.systemManaged) return;
    if (!confirm('¿Eliminar este egreso?')) return;
    this.service.deleteOut(this.id(), out.id).subscribe((res) => {
      if (res.success) this.load(this.id());
    });
  }

  goBack() {
    this.router.navigate(['/pat/budget']);
  }
}

import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PatActivityBenefitService } from '@/app/core/services/pat/pat-activity-benefit.service';
import { PatActivityBenefit } from '@/app/core/models/pat/pat-models';
import { PatBenefitUpsertModalComponent } from './components/benefit-upsert-modal.component';
import { ProjectSectionCardComponent } from '@/app/features/projects/pages/project-detail/components/project-section-card/project-section-card.component';

@Component({
  selector: 'app-pat-benefits-tab',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PatBenefitUpsertModalComponent,
    ProjectSectionCardComponent,
  ],
  templateUrl: './benefits-tab.component.html',
})
export class PatBenefitsTabComponent {
  private readonly service = inject(PatActivityBenefitService);

  activityId = input.required<number>();
  benefits = signal<PatActivityBenefit[]>([]);

  upsertModalOpen = signal(false);
  editingBenefit = signal<PatActivityBenefit | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'benefitTypeName', label: 'Tipo de beneficio' },
    { key: 'targetValue', label: 'Meta' },
  ];

  constructor() {
    effect(() => {
      this.service.findByActivity(this.activityId()).subscribe((res) => {
        if (res.success) this.benefits.set(res.data);
      });
    });
  }

  openCreate(): void {
    this.editingBenefit.set(null);
    this.upsertModalOpen.set(true);
  }

  openEdit(benefit: PatActivityBenefit): void {
    this.editingBenefit.set(benefit);
    this.upsertModalOpen.set(true);
  }

  closeUpsertModal(): void {
    this.upsertModalOpen.set(false);
    this.editingBenefit.set(null);
  }

  onSaved(benefit: PatActivityBenefit): void {
    const current = this.benefits();
    const idx = current.findIndex((b) => b.id === benefit.id);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = benefit;
      this.benefits.set(updated);
    } else {
      this.benefits.set([...current, benefit]);
    }
    this.closeUpsertModal();
  }

  delete(benefit: PatActivityBenefit): void {
    this.service.delete(benefit.id).subscribe({
      next: () => {
        this.benefits.set(this.benefits().filter((b) => b.id !== benefit.id));
      },
    });
  }
}

import { Component, inject } from '@angular/core';
import { BenefitTypeService } from '@/app/core/services/pat/benefit-type.service';
import { TableColumn } from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { PatParamSectionComponent } from './pat-param-section.component';
import { PatUpsertField } from './pat-upsert-modal.component';

@Component({
  selector: 'app-benefit-type-section',
  standalone: true,
  imports: [PatParamSectionComponent],
  template: `
    <app-pat-param-section
      title="Tipos de impacto"
      entityName="tipo de impacto"
      [service]="service"
      [columns]="columns"
      [fields]="fields"
    />
  `,
})
export class BenefitTypeSectionComponent {
  protected readonly service = inject(BenefitTypeService);

  readonly columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    {
      key: 'name',
      label: 'Nombre',
      filterSet: { valueType: 'text', operators: ['lk', 'eq'] },
    },
  ];

  readonly fields: PatUpsertField[] = [
    { key: 'name', label: 'Nombre', required: true, maxLength: 150 },
  ];
}

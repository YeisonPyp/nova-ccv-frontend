import { CommonModule } from '@angular/common';
import { Component, input, output, signal, ViewChild } from '@angular/core';
import { PaginationTableComponent } from '@/app/shared/components/pagination-table/pagination-table.component';
import { TableColumn } from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import {
  PatUpsertField,
  PatUpsertModalComponent,
} from './pat-upsert-modal.component';
import { ParametrizationSectionComponent } from '@/app/features/conf/components/parametrization-section.component';

@Component({
  selector: 'app-pat-param-section',
  standalone: true,
  imports: [
    CommonModule,
    PaginationTableComponent,
    PatUpsertModalComponent,
    ParametrizationSectionComponent,
  ],
  template: `
    <app-parametrization-section
      [title]="title()"
      (onCreate)="openCreate()"
      (onOpen)="onOpen($event)"
    >
      @if (isOpen()) {
        <app-pagination-table
          #table
          [service]="service()"
          [tableColumns]="columns()"
        >
          <ng-template #actions let-item>
            <button
              class="text-xs text-primary hover:underline"
              (click)="openEdit(item)"
            >
              Editar
            </button>
          </ng-template>
        </app-pagination-table>
      }
    </app-parametrization-section>

    <app-pat-upsert-modal
      [isOpen]="modalOpen()"
      [entityName]="entityName()"
      [fields]="fields()"
      [editing]="editing()"
      [service]="service()"
      (onClose)="modalOpen.set(false)"
      (onSaved)="onSaved()"
    />
  `,
})
export class PatParamSectionComponent {
  readonly title = input.required<string>();
  readonly entityName = input.required<string>();
  readonly service = input.required<FilterServiceSpecImpl<any, any>>();
  readonly columns = input.required<TableColumn[]>();
  readonly fields = input.required<PatUpsertField[]>();
  isOpen = signal<boolean>(false);

  @ViewChild('table') table?: PaginationTableComponent<any>;

  modalOpen = signal(false);
  editing = signal<any | null>(null);

  openCreate() {
    this.editing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(item: any) {
    this.editing.set(item);
    this.modalOpen.set(true);
  }

  onOpen(isOpen: boolean) {
    this.isOpen.set(isOpen);
  }

  onSaved() {
    this.modalOpen.set(false);
    this.editing.set(null);
    // this.table?.load(this.table.currentPage());
  }
}

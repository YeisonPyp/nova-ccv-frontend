import { Employee } from '@/app/core/models/assessment/employee.model';
import { TrainingParticipant } from '@/app/core/models/training/training.models';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ChipItemComponent } from '@/app/shared/components/search-select/chip-item/chip-item.component';
import { SearchSelectOption } from '@/app/shared/components/search-select/on-search-select.interface';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-training-participants',
  templateUrl: './training-participants.component.html',
  standalone: true,
  imports: [DynamicTableComponent, ChipItemComponent],
})
export class TrainingParticipantsComponent {
  participants = input.required<TrainingParticipant[]>();
  employees = input.required<Employee[]>();

  onAddEmployee = output<Employee>();
  onRemoveParticipant = output<TrainingParticipant>();

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'lastName', label: 'Apellido' },
    { key: 'email', label: 'Correo Electrónico' },
    { key: 'position.name', label: 'Puesto' },
  ];

  mapOptionFromParticipant(p: TrainingParticipant): SearchSelectOption {
    return {
      id: p.id,
      title: `${p.employeeName} ${p.employeeLastname || ''} (${p.employeeEmail}) `,
    };
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingRequestService } from '@/app/core/services/training/training-request.service';
import { TrainingRequest } from '@/app/core/models/training/training-request.models';
import { AuthService } from '@/app/core/services/auth.service';
import { PaginationTableComponent } from '@/app/shared/components/pagination-table/pagination-table.component';
import { TableColumn } from '@/app/shared/components/dynamic-table/dynamic-table.component';

/**
 * Training requests. The backend already scopes the list: own requests, or
 * every request when the user holds TRAINING_REQUEST_READ_ALL.
 */
@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [CommonModule, PaginationTableComponent],
  templateUrl: './requests-list.component.html',
})
export class RequestsListComponent {
  readonly service = inject(TrainingRequestService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  get canReadAll() {
    return this.auth.hasPermission('TRAINING_REQUEST_READ_ALL');
  }

  get canCreate() {
    return this.auth.hasPermission('TRAINING_REQUEST_CREATE');
  }

  columns: TableColumn[] = [
    { key: 'topic', label: 'Tema' },
    { key: 'trainingTopicName', label: 'Categoría' },
    { key: 'modalityName', label: 'Modalidad' },
    { key: 'priorityName', label: 'Prioridad' },
    {
      key: 'duration',
      label: 'Duración',
      valueCallBack: (r: TrainingRequest) => `${r.duration} h`,
    },
    { key: 'status', label: 'Estado' },
    {
      key: 'requestingUser',
      label: 'Solicitante',
      valueCallBack: (r: TrainingRequest) =>
        `${r.requestingUserFirstName ?? ''} ${r.requestingUserLastName ?? ''}`.trim(),
    },
  ];

  openDetail(r: TrainingRequest) {
    this.router.navigate(['/training/requests', r.id]);
  }

  openCreate() {
    this.router.navigate(['/training/requests/create']);
  }
}

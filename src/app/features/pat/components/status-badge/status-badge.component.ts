// pat/components/status-badge/status-badge.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramStatus } from '../../models/pat.models';
import {
  PROGRAM_STATUS_CONFIG,
  getProgramStatusClass,
} from '../../utils/pat-status.utils';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge status-badge--{{ cssClass() }}">
      <span class="material-icons status-badge__icon">{{ icon() }}</span>
      {{ label() }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.3px;

      &__icon { font-size: 14px; }

      &--borrador  { background: #e9ecef; color: #495057; }
      &--aprobado  { background: #cfe2ff; color: #084298; }
      &--ejecucion { background: #d1e7dd; color: #0a3622; }
      &--cerrado   { background: #f8d7da; color: #842029; }
    }
  `],
})
export class StatusBadgeComponent {
  status = input.required<ProgramStatus>();

  protected cssClass = () => getProgramStatusClass(this.status());
  protected label    = () => PROGRAM_STATUS_CONFIG[this.status()]?.label ?? this.status();
  protected icon     = () => PROGRAM_STATUS_CONFIG[this.status()]?.icon ?? 'info';
}
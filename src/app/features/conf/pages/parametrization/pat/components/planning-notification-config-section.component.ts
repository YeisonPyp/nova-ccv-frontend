import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@/app/core/services/auth.service';
import { PatPlanningNotificationConfigService } from '@/app/core/services/pat/pat-planning-notification-config.service';
import {
  PAT_PLANNING_TYPE_LABELS,
  PatPlanningNotificationConfig,
} from '@/app/core/models/pat/pat-planning-notification-config.model';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ParametrizationSectionComponent } from '@/app/features/conf/components/parametrization-section.component';

/**
 * Editor for the four seeded rows of pat_planning_notification_config: when the
 * monthly-planning reminder of each planning kind fires. Rows cannot be created
 * or deleted — the planning kinds are fixed — so only editing is offered.
 */
@Component({
  selector: 'app-pat-planning-notification-config-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    ParametrizationSectionComponent,
  ],
  templateUrl: './planning-notification-config-section.component.html',
})
export class PatPlanningNotificationConfigSectionComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(PatPlanningNotificationConfigService);

  items = signal<PatPlanningNotificationConfig[]>([]);
  loaded = signal(false);
  editingItem = signal<PatPlanningNotificationConfig | null>(null);

  form = new FormGroup({
    daysBeforeEnd: new FormControl<number | null>(5, [
      Validators.required,
      Validators.min(0),
    ]),
    alertTime: new FormControl('08:00', [Validators.required]),
    timeZone: new FormControl('America/Bogota', [Validators.required]),
    templateName: new FormControl('pat-planning-notification.html', [
      Validators.required,
    ]),
    isActive: new FormControl(true),
  });

  columns: TableColumn[] = [
    {
      key: 'planningType',
      label: 'Planeación',
      valueCallBack: (item: PatPlanningNotificationConfig) =>
        PAT_PLANNING_TYPE_LABELS[item.planningType] ?? item.planningType,
    },
    { key: 'daysBeforeEnd', label: 'Días antes de terminar el mes' },
    { key: 'alertTime', label: 'Hora de alerta' },
    { key: 'timeZone', label: 'Zona horaria' },
    { key: 'templateName', label: 'Plantilla' },
    {
      key: 'isActive',
      label: 'Activo',
      valueCallBack: (item: PatPlanningNotificationConfig) =>
        item.isActive ? 'Sí' : 'No',
    },
  ];

  get canRead() {
    return this.auth.hasPermission('PAT_PLANNING_NOTIFICATION_CONFIG_READ');
  }

  get canUpdate() {
    return this.auth.hasPermission('PAT_PLANNING_NOTIFICATION_CONFIG_UPDATE');
  }

  typeLabel(item: PatPlanningNotificationConfig): string {
    return PAT_PLANNING_TYPE_LABELS[item.planningType] ?? item.planningType;
  }

  onToggle(open: boolean) {
    if (open && !this.loaded()) this.load();
  }

  load() {
    this.service.findAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.loaded.set(true);
          this.items.set(res.data);
        }
      },
      error: () => this.loaded.set(false),
    });
  }

  openEdit(item: PatPlanningNotificationConfig) {
    this.form.reset({
      daysBeforeEnd: item.daysBeforeEnd,
      alertTime: item.alertTime,
      timeZone: item.timeZone,
      templateName: item.templateName,
      isActive: item.isActive,
    });
    this.editingItem.set(item);
  }

  closeModal() {
    this.editingItem.set(null);
  }

  submit() {
    const item = this.editingItem();
    if (!item || this.form.invalid) return;
    const { daysBeforeEnd, alertTime, timeZone, templateName, isActive } =
      this.form.value;

    this.service
      .update(item.id, {
        daysBeforeEnd: daysBeforeEnd!,
        alertTime: alertTime!,
        timeZone: timeZone!,
        templateName: templateName!,
        isActive: isActive ?? true,
      })
      .subscribe({
        next: () => {
          this.closeModal();
          this.load();
        },
      });
  }
}

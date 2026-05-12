import { Component, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { ProjectActivity } from "@/app/core/models/projects/project.model";
import { ActivityUpsertModalComponent } from "../activity-upsert-modal/activity-upsert-modal.component";
import { ProjectSectionCardComponent } from "../project-section-card/project-section-card.component";
import { PriorityLabelPipe } from "../pipes/priority";

@Component({
  selector: "app-activities-section",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    ActivityUpsertModalComponent,
    ProjectSectionCardComponent,
    PriorityLabelPipe,
  ],
  templateUrl: "./activities-section.component.html",
})
export class ActivitesSectionComponent {
  projectId = input.required<number>();
  activityModalOpen = signal(false);
  editingActivity = signal<ProjectActivity | null>(null);

  activities = input.required<ProjectActivity[]>();

  onSaved = output<ProjectActivity>();

  readonly activityColumns: TableColumn<ProjectActivity>[] = [
    { key: "displayOrder", label: "#" },
    { key: "name", label: "Nombre" },
    { key: "startsAt", label: "Inicio" },
    { key: "endsAt", label: "Fin" },
    { key: "priority", label: "Prioridad" },
    { key: "status", label: "Estado" },
    { key: "progressPercentage", label: "Avance" },
  ];

  openCreateActivity(): void {
    this.editingActivity.set(null);
    this.activityModalOpen.set(true);
  }

  openEditActivity(activity: ProjectActivity): void {
    this.editingActivity.set(activity);
    this.activityModalOpen.set(true);
  }

  closeActivityModal(): void {
    this.activityModalOpen.set(false);
    this.editingActivity.set(null);
  }

  onActivitySaved(_activity: ProjectActivity): void {
    this.closeActivityModal();
    this.onSaved.emit(_activity);
  }
}

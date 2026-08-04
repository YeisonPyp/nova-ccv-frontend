import { ProjectActivity } from '@/app/core/models/projects/project.model';
import { DynamicColor } from '@/app/shared/utils/dynamic-color';
import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-activity-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-card.component.html',
})
export class ActivityCardComponent {
  activity = input.required<ProjectActivity>();
  onEdit = output<ProjectActivity>();

  dynamicColor = computed(() => new DynamicColor(this.activity().colorHex));

  onClick() {
    this.onEdit.emit(this.activity());
  }
}

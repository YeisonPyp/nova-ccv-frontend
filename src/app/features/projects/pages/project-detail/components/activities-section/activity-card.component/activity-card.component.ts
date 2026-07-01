import { ProjectActivity } from '@/app/core/models/projects/project.model';
import { DynamicColor } from '@/app/features/pat/components/projects-tab/project-card/project-card.component';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-card.component.html',
  host: {
    '[style.background-color]': 'dynamicColor().background',
    '[style.color]': 'dynamicColor().foreground',
    '[onclick]': 'onClick()',
  },
})
export class ActivityCardComponent {
  private readonly router = inject(Router);
  activity = input.required<ProjectActivity>();

  dynamicColor = computed(() => new DynamicColor(this.activity().colorHex));

  onClick() {
    this.router.navigate(['/pat/activity', this.activity().id]);
  }
}

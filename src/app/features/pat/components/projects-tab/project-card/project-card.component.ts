import { Project } from '@/app/core/models/projects/project.model';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

export class DynamicColor {
  constructor(private c: string) {}

  get background() {
    return this.c;
  }

  get foreground() {
    const hex = this.c;

    if (!hex || hex.length !== 6) return '#000000';

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;

    return brightness > 128 ? '#000000' : '#ffffff';
  }
}

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-card.component.html',
  host: {
    '[style.background-color]': 'hostBackgroundColor()',
    '[style.color]': 'foregroundColor()',
  },
})
export class ProjectCardComponent {
  private readonly router = inject(Router);
  project = input.required<Project>();

  dynamicColor = computed(() => new DynamicColor(this.project().status.color));

  hostBackgroundColor = computed(() => this.dynamicColor().background);

  foregroundColor = computed(() => this.dynamicColor().foreground);

  onClick() {
    this.router.navigate(['/projects', this.project().id]);
  }
}

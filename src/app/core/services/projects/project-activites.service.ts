import { inject, Injectable } from '@angular/core';
import {
  ProjectActivity,
  ProjectRisk,
} from '@/app/core/models/projects/project.model';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Task } from 'dhtmlx-gantt';

export interface GanttLink {
  id: number;
  source: number;
  target: number;
  type: string;
  lag: number;
}

export interface GanttData {
  data: Task[];
  links: GanttLink[];
}

export interface CreateActivityDto {
  projectId: number;
  parentId?: number | null;
  name: string;
  description?: string;
  displayOrder: number;
  starts?: string;
  ends?: string;
  priority?: string;
  budgetAmount?: number | null;
  colorHex?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  extreme: '#ef4444',
};

@Injectable({ providedIn: 'root' })
export class ProjectActivitiesService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  private activityUpdateSource = new Subject<ProjectActivity>();
  private activityCreateSource = new Subject<ProjectActivity>();

  $onUpdateActivity = this.activityUpdateSource.asObservable();
  $onCreateActivity = this.activityCreateSource.asObservable();

  createActivity(
    dto: CreateActivityDto,
  ): Observable<ApiResponse<ProjectActivity>> {
    return this.http
      .post<
        ApiResponse<ProjectActivity>
      >(`${this.base}/project-activities`, dto)
      .pipe(tap((response) => this.activityCreateSource.next(response.data)));
  }

  updateActivity(
    id: number,
    dto: CreateActivityDto,
  ): Observable<ApiResponse<ProjectActivity>> {
    return this.http
      .put<
        ApiResponse<ProjectActivity>
      >(`${this.base}/project-activities/${id}`, dto)
      .pipe(tap((response) => this.activityUpdateSource.next(response.data)));
  }

  parseActivityToGantt(a: ProjectActivity): Task {
    const rawColor = a.colorHex?.trim();
    const color = rawColor ? '#' + rawColor.replace('#', '') : undefined;

    return {
      id: a.id,
      text: a.name,
      start_date: a.startsAt ? new Date(a.startsAt) : undefined,
      progress: (a.progressPercentage ?? 0) / 100,
      parent: a.parentId ?? 0,
      open: true,
      color,
      end_date: a.endsAt ? new Date(a.endsAt) : undefined,
    };
  }

  parseActivitesToGannt(activities: ProjectActivity[]): GanttData {
    const data = activities.map((a) => this.parseActivityToGantt(a));

    // FS link for each child: source = parent, target = child (type "0" = FS)
    const links: GanttLink[] = activities
      .filter((a) => a.parentId != null)
      .map((a, i) => ({
        id: i + 1,
        source: a.parentId!,
        target: a.id,
        type: '0',
        lag: 0,
      }));

    return { data, links };
  }

  parseRisksToGantt(risks: ProjectRisk[]): GanttData {
    const data: Task[] = risks.map((r) => {
      const durationDays = r.estimatedHours
        ? Math.max(1, Math.ceil(r.estimatedHours / 8))
        : 1;

      const color = PRIORITY_COLORS[r.priority] ?? PRIORITY_COLORS['medium'];

      return {
        id: r.id,
        text: r.name,
        start_date: r.createdAt ? new Date(r.createdAt) : undefined,
        duration: durationDays,
        progress: 0,
        parent: 0,
        open: false,
        color,
        status: r.priority,
      };
    });

    return { data, links: [] };
  }
}

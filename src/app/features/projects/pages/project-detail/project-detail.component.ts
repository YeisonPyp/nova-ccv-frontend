import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ProjectService } from "@/app/core/services/projects/project.service";
import {
  Project,
  ProjectActivity,
  ProjectRisk,
} from "@/app/core/models/projects/project.model";
import { RisksSectionComponent } from "./components/risks-section/risks-section.component";
import { ActivitesSectionComponent } from "./components/activities-section/activities-section.component";
import { GanntSectionComponent } from "./components/gantt-section/gannt-section.component";

@Component({
  selector: "app-project-detail",
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RisksSectionComponent,
    ActivitesSectionComponent,
    GanntSectionComponent,
  ],
  templateUrl: "./project-detail.component.html",
  styleUrl: "./project-detail.component.scss",
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ProjectService);

  project = signal<Project | null>(null);
  loading = signal(true);
  ganttLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const projectId = Number(this.route.snapshot.paramMap.get("id"));

    this.service.findById(projectId).subscribe({
      next: (res) => {
        if (res.success) this.project.set(res.data);
        else this.error.set(res.message);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Error al cargar el proyecto");
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/projects"]);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVO: "badge-success",
      FINALIZADO: "badge-secondary",
      SUSPENDIDO: "badge-warning",
      CANCELADO: "badge-danger",
      PLANEACION: "badge-info",
    };
    return map[status?.toUpperCase()] ?? "badge-secondary";
  }

  onActivitySaved(a: ProjectActivity) {
    this.project.update((p) => {
      if (!p) return p;
      const activitiesMap = this.projectActivities.reduce(
        (acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        },
        {} as Record<number, ProjectActivity>,
      );
      activitiesMap[a.id] = a;
      const updatedActivities = Object.values(activitiesMap);

      return { ...p, activities: updatedActivities };
    });
  }

  onRiskSaved(r: ProjectRisk) {
    this.project.update((p) => {
      if (!p) return p;
      return { ...p, risks: [...this.projectRisks, r] };
    });
  }

  get projectActivities() {
    return (
      this.project()?.activities?.sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ) ?? []
    );
  }

  get projectRisks() {
    return this.project()?.risks ?? [];
  }
}

import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  inject,
  signal,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { gantt } from "dhtmlx-gantt";
import { ProjectService } from "../../../../core/services/projects/project.service";
import {
  GanttData,
  Project,
} from "../../../../core/models/projects/project.model";

@Component({
  selector: "app-project-detail",
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: "./project-detail.component.html",
  styleUrl: "./project-detail.component.scss",
})
export class ProjectDetailComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild("ganttContainer") ganttContainer!: ElementRef<HTMLDivElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ProjectService);

  project = signal<Project | null>(null);
  loading = signal(true);
  ganttLoading = signal(true);
  error = signal<string | null>(null);

  private pendingGanttData: GanttData | null = null;
  private ganttInitialized = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));

    this.service.findById(id).subscribe({
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

    this.service.getGanttData(id).subscribe({
      next: (res) => {
        this.ganttLoading.set(false);
        if (this.ganttInitialized) {
          gantt.clearAll();
          gantt.parse(res.data);
        } else {
          this.pendingGanttData = res.data;
        }
      },
      error: () => this.ganttLoading.set(false),
    });
  }

  ngAfterViewInit(): void {
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.auto_scheduling = true;
    // gantt.config.date_format = "%Y-%m-%d";

    gantt.config.columns = [
      { name: "text", label: "Actividad", width: 200, tree: true },
      { name: "start_date", label: "Inicio", align: "center", width: 90 },
      { name: "duration", label: "Días", align: "center", width: 50 },
      { name: "status", label: "Estado", align: "center", width: 90 },
    ];

    gantt.init(this.ganttContainer.nativeElement);
    this.ganttInitialized = true;

    if (this.pendingGanttData) {
      gantt.parse(this.pendingGanttData);
      this.pendingGanttData = null;
    }
  }

  ngOnDestroy(): void {
    if (this.ganttInitialized) {
      gantt.clearAll();
    }
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
}

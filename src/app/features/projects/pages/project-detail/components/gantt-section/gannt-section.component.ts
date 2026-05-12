import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ProjectActivity,
  ProjectRisk,
} from "@/app/core/models/projects/project.model";
import { gantt } from "dhtmlx-gantt";
import { ProjectActivitiesService } from "@/app/core/services/projects/project-activites.service";

@Component({
  selector: "app-gannt-section",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./gannt-section.component.html",
  styleUrl: "./gannt-section.component.scss",
})
export class GanntSectionComponent implements AfterViewInit {
  ganttContainer =
    viewChild.required<ElementRef<HTMLDivElement>>("ganttContainer");

  service = inject(ProjectActivitiesService);

  activities = input.required<ProjectActivity[]>();
  risks = input.required<ProjectRisk[]>();

  ganntInitialized = signal(false);

  ngAfterViewInit(): void {
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.auto_scheduling = true;

    gantt.config.columns = [
      {
        name: "text",
        label: "Actividad",
        width: 200,
        tree: true,
      },
      {
        name: "add",
        label: "",
        width: 44,
      },
    ];

    const container = this.ganttContainer();

    gantt.init(container.nativeElement);

    const d = this.service.parseActivitesToGannt(this.activities());
    gantt.parse(d);

    // gantt.attachEvent("onAfterTaskUpdate", (d) => {
    //   console.log(gantt.getTask(d));
    // });

    // gantt.attachEvent("onAfterLinkAdd", (d) => {
    //   console.log(gantt.getLink(d));
    // });

    this.ganntInitialized.set(true);
  }

  ngOnDestroy(): void {
    if (this.ganntInitialized()) {
      gantt.clearAll();
    }
  }

  constructor() {
    this.service.$onUpdateActivity.subscribe((a) => {
      if (this.ganntInitialized()) {
        gantt.updateTask(a.id, this.service.parseActivityToGantt(a));
      }
    });
    this.service.$onCreateActivity.subscribe((a) => {
      if (this.ganntInitialized()) {
        gantt.addTask(
          this.service.parseActivityToGantt(a),
          a.parentId,
          a.displayOrder,
        );
      }
    });
  }
}

import { Component } from "@angular/core";
import { ActivityStatusParamComponent } from "./components/activity-status/activity-status-param.component";
import { ProjectPriorityParamComponent } from "./components/project-priority/project-priority-param.component";
import { ProjectStatusParamComponent } from "./components/project-status/project-status-param.component";

@Component({
  selector: "app-projects-param",
  standalone: true,
  imports: [ActivityStatusParamComponent, ProjectPriorityParamComponent, ProjectStatusParamComponent],
  templateUrl: "./projects-param.component.html",
})
export class ProjectsParamComponent {}

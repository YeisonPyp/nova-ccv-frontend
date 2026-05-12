import { Component, signal } from "@angular/core";
import { Workflow } from "@/app/core/models/filing/workflow.model";
import { WorkflowListParamComponent } from "./components/workflow-list/workflow-list-param.component";
import { WorkflowStepsParamComponent } from "./components/workflow-steps/workflow-steps-param.component";

@Component({
  selector: "app-workflows-param",
  standalone: true,
  imports: [WorkflowListParamComponent, WorkflowStepsParamComponent],
  templateUrl: "./workflows-param.component.html",
})
export class WorkflowsParamComponent {
  selectedWorkflow = signal<Workflow | null>(null);

  onWorkflowSelected(wf: Workflow | null) {
    this.selectedWorkflow.set(wf);
  }
}

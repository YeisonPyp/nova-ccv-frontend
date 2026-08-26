import { Component } from "@angular/core";
import { ControlEntityParamComponent } from "./components/control-entity/control-entity-param.component";
import { FilingProcessParamComponent } from "./components/filing-process/filing-process-param.component";

@Component({
  selector: "app-filing-param",
  standalone: true,
  imports: [ControlEntityParamComponent, FilingProcessParamComponent],
  templateUrl: "./filing-param.component.html",
})
export class FilingParamComponent {}

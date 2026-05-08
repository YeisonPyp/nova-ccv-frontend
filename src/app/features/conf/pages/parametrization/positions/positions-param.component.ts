import { Component } from "@angular/core";
import { AreasParamComponent } from "./components/areas/areas-param.component";
import { PositionsListParamComponent } from "./components/positions-list/positions-list-param.component";

@Component({
  selector: "app-positions-param",
  standalone: true,
  imports: [AreasParamComponent, PositionsListParamComponent],
  templateUrl: "./positions-param.component.html",
})
export class PositionsParamComponent {}

import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Employee } from "@/app/core/models/assessment/employee.model";

@Component({
  selector: "app-employee-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./employee-card.component.html",
})
export class EmployeeCardComponent {
  employee = input.required<Employee>();
}

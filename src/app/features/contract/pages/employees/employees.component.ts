import { Component, inject, OnInit, signal } from "@angular/core";
import { EmployeeService } from "@/app/core/services/assessment/employee.service";
import { Employee } from "@/app/core/models/assessment/employee.model";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginatorComponent } from "@/app/shared/components/paginator/paginator.component";

@Component({
  selector: "app-employees",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginatorComponent],
  templateUrl: "./employees.component.html",
  styleUrl: "./employees.component.scss",
})
export class EmployeesComponent implements OnInit {
  private service = inject(EmployeeService);
  private router = inject(Router);

  employees = signal<Employee[]>([]);
  size = signal<number>(10);
  page = signal<number>(0);
  totalPages = signal<number>(0);

  columns: TableColumn<Employee>[] = [
    { key: "name", label: "Nombre" },
    { key: "lastName", label: "Apellido" },
    { key: "email", label: "Correo Electrónico" },
    { key: "position.name", label: "Puesto" },
  ];

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees() {
    this.service
      .findEmployees({ page: this.page(), size: this.size() })
      .subscribe((res) => {
        if (res.data && res.data.content) {
          this.employees.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        }
      });
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.fetchEmployees();
  }

  onSizeChange(newSize: number) {
    this.size.set(newSize);
    this.page.set(0);
    this.fetchEmployees();
  }

  openCreate() {
    this.router.navigate(["/employees/create"]);
  }

  openEdit(employee: Employee) {
    this.router.navigate(["/employees", employee.id, "edit"], {
      state: { employee },
    });
  }

  onDelete(employee: Employee) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar a "${employee.name} ${employee.lastName}"?`,
      )
    ) {
      this.service.deleteEmployee(employee.id).subscribe({
        next: () => this.fetchEmployees(),
        error: (err) => console.error("Failed to delete employee", err),
      });
    }
  }
}

import { Component, inject, OnInit, signal } from "@angular/core";
import {
  EmployeeService,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../../../../core/services/assessment/employee.service";
import { Employee } from "../../../../core/models/assessment/employee.model";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginatorComponent } from "../../../../shared/components/paginator/paginator.component";
import { EmployeeModalComponent } from "./employee-modal/employee-modal.component";

@Component({
  selector: "app-employees",
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginatorComponent,
    EmployeeModalComponent,
  ],
  templateUrl: "./employees.component.html",
  styleUrl: "./employees.component.scss",
})
export class EmployeesComponent implements OnInit {
  private service = inject(EmployeeService);

  employees = signal<Employee[]>([]);
  size = signal<number>(10);
  page = signal<number>(1);
  totalPages = signal<number>(0);

  isModalOpen = signal(false);
  isEdit = signal(false);
  selectedEmployee = signal<Employee | null>(null);

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
    this.page.set(1);
    this.fetchEmployees();
  }

  openCreateModal() {
    this.isEdit.set(false);
    this.selectedEmployee.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(employee: Employee) {
    this.isEdit.set(true);
    this.selectedEmployee.set(employee);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedEmployee.set(null);
  }

  onSaveEmployee(dto: CreateEmployeeDto | UpdateEmployeeDto) {
    if (this.isEdit() && this.selectedEmployee()) {
      this.service.updateEmployee(this.selectedEmployee()!.id, dto).subscribe({
        next: () => {
          this.closeModal();
          this.fetchEmployees();
        },
        error: (err) => {
          console.error("Failed to update employee", err);
        },
      });
    } else {
      this.service.createEmployee(dto as CreateEmployeeDto).subscribe({
        next: () => {
          this.closeModal();
          this.fetchEmployees();
        },
        error: (err) => {
          console.error("Failed to create employee", err);
        },
      });
    }
  }

  onDeleteEmployee(employee: Employee) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar a "${employee.name} ${employee.lastName}"?`,
      )
    ) {
      this.service.deleteEmployee(employee.id).subscribe({
        next: () => {
          this.fetchEmployees();
        },
        error: (err) => {
          console.error("Failed to delete employee", err);
        },
      });
    }
  }
}

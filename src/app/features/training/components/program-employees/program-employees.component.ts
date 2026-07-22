import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { TrainingProgramService } from '@/app/core/services/training/training-program.service';
import { EmployeeService } from '@/app/core/services/assessment/employee.service';
import { ProgramEmployee } from '@/app/core/models/training/training-program.models';
import { SearchSelectComponent } from '@/app/shared/components/search-select/search-select.component';
import { ChipItemComponent } from '@/app/shared/components/search-select/chip-item/chip-item.component';
import { SearchSelectOption } from '@/app/shared/components/search-select/on-search-select.interface';

@Component({
  selector: 'app-program-employees',
  standalone: true,
  imports: [CommonModule, SearchSelectComponent, ChipItemComponent],
  templateUrl: './program-employees.component.html',
})
export class ProgramEmployeesComponent {
  private readonly service = inject(TrainingProgramService);
  private readonly employeeService = inject(EmployeeService);

  programId = input.required<number>();

  employees = signal<ProgramEmployee[]>([]);
  selectedEmployeeId = signal<number | null>(null);

  employeeContext = this.employeeService.newSearchSelectEmployeeContext(
    (e) => this.selectedEmployeeId.set(e.id),
    { maxItems: 1, label: 'Empleado', placeholder: 'Buscar empleado…' },
    () => this.selectedEmployeeId.set(null),
  );

  constructor() {
    effect(() => {
      this.load(this.programId());
    });
  }

  load(id: number) {
    this.service.getDetail(id).subscribe((res) => {
      this.employees.set(res.data?.employees ?? []);
    });
  }

  chipOf(e: ProgramEmployee): SearchSelectOption {
    return { id: e.id, title: `${e.employeeName} ${e.employeeLastName}` };
  }

  searchEmployee(term: string) {
    this.employeeContext.search(term);
  }
  selectEmployee(o: SearchSelectOption) {
    this.employeeContext.select(o);
  }
  removeSelected(o: SearchSelectOption) {
    this.employeeContext.remove(o);
  }

  add() {
    const employeeId = this.selectedEmployeeId();
    if (!employeeId) return;
    this.service.addEmployee(this.programId(), employeeId).subscribe((res) => {
      if (res.success) {
        this.employeeContext.clear();
        this.selectedEmployeeId.set(null);
        this.load(this.programId());
      }
    });
  }

  remove(e: ProgramEmployee) {
    this.service.removeEmployee(this.programId(), e.id).subscribe((res) => {
      if (res.success) this.load(this.programId());
    });
  }
}

import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { TrainingProgramService } from '@/app/core/services/training/training-program.service';
import { EmployeeService } from '@/app/core/services/assessment/employee.service';
import { ProgramEmployee } from '@/app/core/models/training/training-program.models';
import { TrainingParticipant } from '@/app/core/models/training/training.models';
import { Employee } from '@/app/core/models/assessment/employee.model';
import { TrainingParticipantsComponent } from '../training-participants/training-participants.component';

/**
 * Program employees tab. Reuses the presentational `training-participants`
 * component (chips of enrolled + table of employees to add).
 */
@Component({
  selector: 'app-program-employees',
  standalone: true,
  imports: [TrainingParticipantsComponent],
  template: `<app-training-participants
    [participants]="participantsView()"
    [employees]="availableEmployees()"
    (onAddEmployee)="add($event)"
    (onRemoveParticipant)="remove($event)"
  />`,
})
export class ProgramEmployeesComponent {
  private readonly service = inject(TrainingProgramService);
  private readonly employeeService = inject(EmployeeService);

  programId = input.required<number>();

  private programEmployees = signal<ProgramEmployee[]>([]);
  private allEmployees = signal<Employee[]>([]);

  /** Program employees mapped to the participant shape the table expects. */
  participantsView = computed<TrainingParticipant[]>(() =>
    this.programEmployees().map((pe) => ({
      id: pe.id,
      trainingId: this.programId(),
      employeeId: pe.employeeId,
      employeeName: pe.employeeName,
      employeeLastname: pe.employeeLastName,
      employeeEmail: pe.employeeEmail,
      approved: false,
      status: '',
      registeredAt: '',
    })),
  );

  /** Employees not yet enrolled. */
  availableEmployees = computed<Employee[]>(() => {
    const enrolled = new Set(this.programEmployees().map((e) => e.employeeId));
    return this.allEmployees().filter((e) => !enrolled.has(e.id));
  });

  constructor() {
    effect(() => {
      this.loadProgramEmployees(this.programId());
    });
    this.loadEmployees();
  }

  private loadProgramEmployees(id: number) {
    this.service.getDetail(id).subscribe((res) => {
      this.programEmployees.set(res.data?.employees ?? []);
    });
  }

  private loadEmployees() {
    this.employeeService.findEmployees({ page: 0, size: 100 }).subscribe((res) => {
      this.allEmployees.set(res.data?.content ?? []);
    });
  }

  add(employee: Employee) {
    this.service
      .addEmployee(this.programId(), employee.id)
      .subscribe((res) => {
        if (res.success) this.loadProgramEmployees(this.programId());
      });
  }

  remove(participant: TrainingParticipant) {
    this.service
      .removeEmployee(this.programId(), participant.id)
      .subscribe((res) => {
        if (res.success) this.loadProgramEmployees(this.programId());
      });
  }
}

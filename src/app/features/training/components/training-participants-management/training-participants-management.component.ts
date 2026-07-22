import {
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { TrainingParticipantsComponent } from '../training-participants/training-participants.component';
import { TrainingParticipant } from '@/app/core/models/training/training.models';
import { Employee } from '@/app/core/models/assessment/employee.model';
import { TrainingParticipantService } from '@/app/core/services/training/training-participant.service';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-training-participants-management',
  standalone: true,
  imports: [TrainingParticipantsComponent, PaginatorComponent],
  templateUrl: './training-participants-management.component.html',
})
export class TrainingParticipantsManagement implements OnInit {
  private readonly service = inject(TrainingParticipantService);
  trainingId = input.required<number>();

  participants = signal<TrainingParticipant[]>([]);
  employees = signal<Employee[]>([]);

  page = signal<number>(1);
  size = signal<number>(10);
  pages = signal<number>(0);

  isLoading = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.loadEmployees(this.page(), this.size());
    });
  }

  loadEmployees(page: number, size?: number) {
    this.isLoading.set(true);
    this.service
      .findEmployeesToEnroll({
        trainingId: this.trainingId(),
        page: page - 1,
        size: size ?? this.size(),
      })
      .subscribe((res) => {
        this.employees.set(res.data.content);
        this.isLoading.set(false);
        this.pages.set(res.data.totalPages);
      });
  }

  loadParticipants() {
    this.service.getTrainingParticipants(this.trainingId()).subscribe((res) => {
      this.participants.set(res.data);
    });
  }

  ngOnInit(): void {
    this.loadParticipants();
  }

  onAddEmployee(e: Employee) {
    this.service.enrollParticipant(this.trainingId(), e.id).subscribe((res) => {
      const pMap = this.participants().reduce(
        (acc, p) => {
          acc[p.employeeId] = p;
          return acc;
        },
        {} as Record<number, TrainingParticipant>,
      );
      pMap[e.id] = res.data;
      this.participants.set(Object.values(pMap));
      this.loadEmployees(this.page());
    });
  }

  onRemoveParticipant(p: TrainingParticipant) {
    this.service.removeParticipant(this.trainingId(), p.id).subscribe(() => {
      this.participants.set(this.participants().filter((pp) => pp.id !== p.id));
    });
  }
}

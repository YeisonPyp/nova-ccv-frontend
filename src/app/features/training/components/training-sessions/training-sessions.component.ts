import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrainingService } from '@/app/core/services/training/training.service';
import {
  TrainingSession,
} from '@/app/core/models/training/training.models';

@Component({
  selector: 'app-training-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './training-sessions.component.html',
})
export class TrainingSessionsComponent {
  private readonly service = inject(TrainingService);

  trainingId = input.required<number>();
  durationHours = input<number | undefined>(undefined);

  sessions = signal<TrainingSession[]>([]);
  loading = signal(false);
  saving = signal(false);

  // add form
  showForm = signal(false);
  sessionDate = signal('');
  startTime = signal(''); // HH:mm
  endTime = signal(''); // HH:mm

  constructor() {
    effect(() => {
      this.load(this.trainingId());
    });
  }

  /** "HH:mm" -> minutes since midnight. */
  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  /** minutes since midnight -> "HH:mm". */
  formatMinutes(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  load(id: number) {
    this.loading.set(true);
    this.service.getDetail(id).subscribe({
      next: (res) => {
        this.sessions.set(res.data?.sessions ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openForm() {
    this.sessionDate.set('');
    this.startTime.set('');
    this.endTime.set('');
    this.showForm.set(true);
  }

  addSession() {
    const date = this.sessionDate();
    const start = this.startTime();
    const end = this.endTime();
    if (!date || !start || !end || this.saving()) return;

    const startsMinutes = this.toMinutes(start);
    const endsMinutes = this.toMinutes(end);
    if (endsMinutes <= startsMinutes) {
      alert('La hora de fin debe ser mayor a la de inicio');
      return;
    }

    this.saving.set(true);
    this.service
      .addSession(this.trainingId(), {
        sessionDate: date,
        startsMinutes,
        endsMinutes,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showForm.set(false);
            this.load(this.trainingId());
          }
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }

  deleteSession(sessionId: number) {
    if (!confirm('¿Eliminar esta sesión?')) return;
    this.service
      .deleteSession(this.trainingId(), sessionId)
      .subscribe((res) => {
        if (res.success) this.load(this.trainingId());
      });
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ScheduleService } from '@/app/core/services/assessment/schedule.service';
import { RoleService } from '@/app/core/services/user/role.service';
import { UserService } from '@/app/core/services/user/user.service';
import { UserResponse } from '@/app/core/models/user/user.model';
import {
  Option,
  SelectorComponent,
} from '@/app/shared/components/selector/selector.component';
import { FileItemComponent } from '@/app/shared/components/file-item/file-item.component';

@Component({
  selector: 'app-seed-users-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectorComponent,
    FileItemComponent,
  ],
  templateUrl: './seed-users-modal.component.html',
})
export class SeedUsersModalComponent {
  private readonly scheduleService = inject(ScheduleService);
  private readonly roleService = inject(RoleService);
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  onClose = output<void>();
  onSeeded = output<UserResponse[]>();

  schedules = toSignal(
    this.scheduleService
      .findAll()
      .pipe(
        map((res) =>
          res.data.map((s) => ({ label: s.name, value: s.id }) as Option),
        ),
      ),
  );
  roles = toSignal(
    this.roleService
      .findAll()
      .pipe(
        map((res) =>
          res.data.map((s) => ({ label: s.name, value: s.id }) as Option),
        ),
      ),
  );

  file = signal<File | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    roleId: [null as number | null, [Validators.required]],
    scheduleId: [null as number | null, [Validators.required]],
  });

  onFileSelected(file: File): void {
    this.file.set(file);
  }

  onFileRemoved(): void {
    this.file.set(null);
  }

  close(): void {
    this.onClose.emit();
  }

  submit(): void {
    if (this.form.invalid || !this.file()) {
      this.form.markAllAsTouched();
      this.error.set(!this.file() ? 'Selecciona un archivo de Excel' : null);
      return;
    }
    const { roleId, scheduleId } = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.userService
      .seedFromExcel(this.file()!, scheduleId!, roleId!)
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          if (res.success) {
            this.onSeeded.emit(res.data);
          }
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(
            err?.error?.message ?? 'Error al sembrar los usuarios',
          );
        },
      });
  }
}

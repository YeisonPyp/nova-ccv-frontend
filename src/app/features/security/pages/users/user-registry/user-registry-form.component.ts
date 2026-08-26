import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PositionService } from '@/app/core/services/assessment/position.service';
import { SelectSearchComponent } from '@/app/shared/components/select-search/select-search.component';
import { SearchSelectOption } from '@/app/shared/components/search-select/on-search-select.interface';
import { ScheduleService } from '@/app/core/services/assessment/schedule.service';
import {
  CreateUserDto,
  UserService,
} from '@/app/core/services/user/user.service';
import { RoleService } from '@/app/core/services/user/role.service';
import { RoleResponse } from '@/app/core/models/user/role.model';
import { Router } from '@angular/router';
import {
  Option,
  SelectorComponent,
} from '@/app/shared/components/selector/selector.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-user-registry-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectSearchComponent,
    SelectorComponent,
  ],
  templateUrl: './user-registry-form.component.html',
})
export class UserRegistryFormComponent {
  private readonly positionService = inject(PositionService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  selectedPositions = signal<SearchSelectOption[]>([]);
  positions = signal<SearchSelectOption[]>([]);
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
  creating = signal(false);

  findPositions(q: string) {
    this.positionService
      .findPositions({ page: 0, size: 10, name: q })
      .subscribe((r) => {
        if (r.success && r.data) {
          this.positions.set(
            r.data.content.map((p) => ({ id: p.id, title: p.name })),
          );
        }
      });
  }

  onRemovePosition(o: SearchSelectOption) {
    this.selectedPositions.set(
      this.selectedPositions().filter((p) => p.id !== o.id),
    );
  }

  onSelectPosition(o: SearchSelectOption) {
    this.selectedPositions.set([o]);
    this.form.patchValue({ positionId: o.id as number });
  }

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    roleId: [null as number | null, [Validators.required]],
    upin: ['', [Validators.required]],
    positionId: [null as number | null, [Validators.required]],
    scheduleId: [null as number | null, [Validators.required]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.creating.set(true);
    this.userService
      .createUser(this.form.getRawValue() as CreateUserDto)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.form.reset();
            this.router.navigate(['users', res.data.id]);
          }
          this.creating.set(false);
        },
        error: () => this.creating.set(false),
      });
  }
}

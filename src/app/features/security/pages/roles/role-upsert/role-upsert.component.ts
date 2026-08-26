import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  switchMap,
} from "rxjs";
import { RoleService } from "@/app/core/services/user/role.service";
import { RoleResponse } from "@/app/core/models/user/role.model";
import { PermissionsManagerComponent } from "@/app/shared/components/permissions-manager/permissions-manager.component";

@Component({
  selector: "app-role-upsert",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PermissionsManagerComponent],
  templateUrl: "./role-upsert.component.html",
})
export class RoleUpsertComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private fb = inject(FormBuilder);

  role = signal<RoleResponse | null>(null);
  isEditMode = signal(false);
  loading = signal(false);
  creating = signal(false);
  saving = signal(false);
  autoSaving = signal(false);

  form: FormGroup = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    description: [""],
  });

  private debounce$ = new Subject<void>();
  private subs = new Subscription();

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam && idParam !== "new") {
      this.isEditMode.set(true);
      this.loadRole(Number(idParam));
      this.setupDebounce();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private setupDebounce(): void {
    const sub = this.debounce$
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap(() => {
          const r = this.role();
          if (!r || this.form.invalid) return [];
          this.autoSaving.set(true);
          return this.roleService.update(r.id, this.form.value);
        }),
      )
      .subscribe({
        next: (res: any) => {
          if (res?.success && res?.data) this.role.set(res.data);
          this.autoSaving.set(false);
        },
        error: () => this.autoSaving.set(false),
      });
    this.subs.add(sub);
  }

  private loadRole(id: number): void {
    this.loading.set(true);
    this.roleService.findById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.role.set(res.data);
          this.form.patchValue({
            name: res.data.name,
            description: res.data.description,
          });
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(["/security/roles"]);
      },
    });
  }

  onFieldChange(): void {
    if (this.isEditMode()) {
      this.debounce$.next();
    }
  }

  onCreate(): void {
    if (this.form.invalid || this.creating()) {
      this.form.markAllAsTouched();
      return;
    }
    this.creating.set(true);
    this.roleService.create(this.form.value).subscribe({
      next: (res) => {
        this.creating.set(false);
        if (res.success && res.data) {
          this.router.navigate(["/security/roles", res.data.id]);
        }
      },
      error: () => this.creating.set(false),
    });
  }

  assignPermission(permName: string): void {
    const r = this.role();
    if (!r || this.saving()) return;
    this.saving.set(true);
    this.roleService.addPermission(r.id, permName).subscribe({
      next: (res) => {
        if (res.success && res.data) this.role.set(res.data);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  removePermission(permName: string): void {
    const r = this.role();
    if (!r || this.saving()) return;
    this.saving.set(true);
    this.roleService.removePermission(r.id, permName).subscribe({
      next: (res) => {
        if (res.success && res.data) this.role.set(res.data);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  goBack(): void {
    this.router.navigate(["/security/roles"]);
  }
}

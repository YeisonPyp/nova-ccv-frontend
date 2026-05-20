import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  switchMap,
} from "rxjs";
import { Employee } from "@/app/core/models/assessment/employee.model";
import { EmployeeService } from "@/app/core/services/assessment/employee.service";
import { PositionService } from "@/app/core/services/assessment/position.service";
import { SearchSelectComponent } from "@/app/shared/components/search-select/search-select.component";
import { SearchSelectOption } from "@/app/shared/components/search-select/on-search-select.interface";

@Component({
  selector: "app-user-employee",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchSelectComponent],
  templateUrl: "./user-employee.component.html",
})
export class UserEmployeeComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private positionService = inject(PositionService);

  userId = input.required<number>();
  employee = input<Employee | null>(null);

  autoSaving = signal(false);

  positionCtx = this.positionService.newSearchSelectContext(undefined, {
    placeholder: "Buscar cargo...",
    maxItems: 1,
  });

  reportsToCtx = this.employeeService.newSearchSelectEmployeeContext(undefined, {
    placeholder: "Buscar empleado...",
    maxItems: 1,
  });

  form = this.fb.group({
    email: [""],
  });

  private debounce$ = new Subject<void>();
  private subs = new Subscription();

  ngOnInit(): void {
    const emp = this.employee();
    if (!emp) return;

    this.form.patchValue({ email: emp.email });

    if (emp.position) {
      this.positionCtx.selectResults([emp.position]);
    }
    if (emp.reportsTo) {
      this.reportsToCtx.selectResults([emp.reportsTo]);
    }

    this.setupDebounce();
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
          const emp = this.employee();
          if (!emp) return [];
          this.autoSaving.set(true);
          const posSelected = this.positionCtx.selectedOptions()[0];
          const reportsSelected = this.reportsToCtx.selectedOptions()[0];
          return this.employeeService.updateEmployee(emp.id, {
            email: this.form.value.email ?? undefined,
            positionId: posSelected ? Number(posSelected.id) : undefined,
            employeeReportsToId: reportsSelected ? Number(reportsSelected.id) : undefined,
          });
        }),
      )
      .subscribe({
        next: () => this.autoSaving.set(false),
        error: () => this.autoSaving.set(false),
      });
    this.subs.add(sub);
  }

  onFieldChange(): void {
    this.debounce$.next();
  }

  onPositionSelect(option: SearchSelectOption): void {
    this.positionCtx.select(option);
    this.debounce$.next();
  }

  onPositionRemove(option: SearchSelectOption): void {
    this.positionCtx.remove(option);
    this.debounce$.next();
  }

  onReportsToSelect(option: SearchSelectOption): void {
    this.reportsToCtx.select(option);
    this.debounce$.next();
  }

  onReportsToRemove(option: SearchSelectOption): void {
    this.reportsToCtx.remove(option);
    this.debounce$.next();
  }
}

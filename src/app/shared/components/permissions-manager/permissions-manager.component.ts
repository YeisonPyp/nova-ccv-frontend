import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { PermissionResponse } from "@/app/core/models/user/permission.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

const PAGE_SIZE = 10;

@Component({
  selector: "app-permissions-manager",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./permissions-manager.component.html",
})
export class PermissionsManagerComponent {
  /** Currently assigned permission names */
  assigned = input.required<string[]>();
  /** All permissions fetched by the parent */
  all = input.required<PermissionResponse[]>();
  /** True once parent has fetched all permissions (controls spinner vs. table) */
  loaded = input<boolean>(false);
  /** Disable assign/remove buttons while a request is in flight */
  saving = input<boolean>(false);
  /** Whether to show assign/remove actions */
  editable = input<boolean>(true);

  assign = output<string>();
  remove = output<string>();

  page = signal(1);

  columns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  available = computed(() => {
    const assignedSet = new Set(this.assigned());
    return this.all().filter((p) => !assignedSet.has(p.name));
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.available().length / PAGE_SIZE)),
  );

  paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.available().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    // Clamp page when available list shrinks after an assign
    effect(() => {
      const max = this.totalPages();
      if (this.page() > max) this.page.set(max);
    });
  }

  doAssign(perm: PermissionResponse): void {
    this.assign.emit(perm.name);
  }

  doRemove(permName: string): void {
    this.remove.emit(permName);
  }
}

import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, input, output, signal } from "@angular/core";
import { ExpressionNode } from "@rsql/ast";
import { PermissionResponse } from "@/app/core/models/user/permission.model";
import { PermissionService } from "@/app/core/services/user/permission.service";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginatorComponent } from "@/app/shared/components/paginator/paginator.component";

/**
 * Assigned permissions as removable chips, plus a paginated and searchable
 * table of the ones still available. The available list is fetched page by
 * page and the owner's own permissions are excluded server-side, so neither
 * the whole catalog nor the assigned names travel over the wire.
 */
@Component({
  selector: "app-permissions-manager",
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, PaginatorComponent],
  templateUrl: "./permissions-manager.component.html",
})
export class PermissionsManagerComponent {
  private readonly service = inject(PermissionService);

  /** Currently assigned permission names */
  assigned = input.required<string[]>();
  /** Owner whose permissions are left out of the available list */
  excludeRoleId = input<number | null>(null);
  excludeUserId = input<number | null>(null);
  /** Disable assign/remove buttons while a request is in flight */
  saving = input<boolean>(false);
  /** Whether to show assign/remove actions */
  editable = input<boolean>(true);

  assign = output<string>();
  remove = output<string>();

  page = signal(1);
  size = signal(10);
  totalPages = signal(0);
  loading = signal(false);
  available = signal<PermissionResponse[]>([]);

  private readonly searchNodes = signal<ExpressionNode[]>([]);

  columns: TableColumn[] = [
    {
      key: "name",
      label: "Nombre",
      filterSet: { valueType: "text", search: true },
    },
    {
      key: "description",
      label: "Descripción",
      filterSet: { valueType: "text", search: true },
    },
  ];

  /** Any change here starts the listing over from the first page. */
  private readonly filterKey = computed(
    () =>
      `${this.excludeRoleId() ?? ""}|${this.excludeUserId() ?? ""}|${this.searchNodes().length}`,
  );
  private lastFilterKey: string | null = null;

  constructor() {
    effect(() => {
      const filterKey = this.filterKey();
      if (this.lastFilterKey !== null && filterKey !== this.lastFilterKey) {
        this.page.set(1);
      }
      this.lastFilterKey = filterKey;

      // Assigning or removing changes what is still available, so the
      // assigned list is a load trigger too.
      this.assigned();

      this.loading.set(true);
      this.service
        .search({
          // The paginator is 1-based, Spring's Pageable is 0-based.
          page: this.page() - 1,
          size: this.size(),
          nodes: this.searchNodes(),
          excludeRoleId: this.excludeRoleId(),
          excludeUserId: this.excludeUserId(),
        })
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.available.set(res.data.content);
              this.totalPages.set(res.data.totalPages);
            }
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
    });
  }

  onSearchChange(nodes: ExpressionNode[]): void {
    this.searchNodes.set(nodes);
  }

  onPageSizeChange(size: number): void {
    this.page.set(1);
    this.size.set(size);
  }

  doAssign(perm: PermissionResponse): void {
    this.assign.emit(perm.name);
  }

  doRemove(permName: string): void {
    this.remove.emit(permName);
  }
}

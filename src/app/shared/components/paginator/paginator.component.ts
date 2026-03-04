import { Component, input, output } from "@angular/core";
import { PaginationComponent } from "../pagination/pagination.component";

@Component({
  selector: "app-paginator",
  standalone: true,
  imports: [PaginationComponent],
  template: `
    <div
      class="pagination-section"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        border-top: 1px solid #eee;
        padding-top: 16px;
      "
    >
      <div
        class="page-size-control"
        style="display: flex; align-items: center; gap: 8px"
      >
        <label
          style="font-size: 0.9rem; color: #595959; font-weight: 500"
        >
          Elementos por página:
        </label>
        <input
          type="number"
          class="form-control"
          [value]="pageSize()"
          (change)="handlePageSizeChange($event)"
          min="1"
          style="width: 80px; padding: 6px 12px; height: 36px"
        />
      </div>

      <app-pagination
        [pages]="totalPages()"
        [currentPage]="currentPage()"
        (pageChange)="onSelectPage.emit($event)"
      >
      </app-pagination>
    </div>
  `,
  styles: [
    `
      .form-control {
        border: 1px solid #d9d9d9;
        border-radius: 6px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
      }
      .form-control:focus {
        border-color: #003380;
      }
    `
  ]
})
export class PaginatorComponent {
  pageSize = input.required<number>();
  currentPage = input.required<number>();
  totalPages = input.required<number>();

  onSelectPage = output<number>();
  pageSizeChange = output<number>();

  handlePageSizeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const size = parseInt(target.value, 10);
    if (!isNaN(size) && size > 0) {
      this.pageSizeChange.emit(size);
    }
  }
}

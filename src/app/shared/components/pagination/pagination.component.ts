import { Component, computed, input, output } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-pagination",
  imports: [FormsModule],
  template: `
    <div class="pagination-container">
      <button
        class="btn btn-secondary"
        [disabled]="currentPage() <= 1"
        (click)="onPageChange(currentPage() - 1)"
      >
        Anterior
      </button>

      <div class="page-selector">
        <label for="page-select">Página:</label>
        <select
          id="page-select"
          class="form-control"
          [ngModel]="currentPage()"
          (ngModelChange)="onPageChange($event)"
        >
          @for (p of pagesArray(); track p) {
            <option [ngValue]="p">{{ p }}</option>
          }
        </select>
        <span class="total-pages">de {{ pages() }}</span>
      </div>

      <button
        class="btn btn-secondary"
        [disabled]="currentPage() >= pages()"
        (click)="onPageChange(currentPage() + 1)"
      >
        Siguiente
      </button>
    </div>
  `,
  styles: [
    `
      .pagination-container {
        display: flex;
        align-items: center;
        gap: 16px;
        justify-content: center;
        margin-top: 16px;
      }

      .page-selector {
        display: flex;
        align-items: center;
        gap: 8px;

        label {
          font-size: 0.9rem;
          color: #595959;
        }

        select {
          width: 80px;
          padding: 6px;
        }

        .total-pages {
          font-size: 0.9rem;
          color: #595959;
        }
      }

      .btn {
        padding: 6px 12px;
        font-size: 0.85rem;
        font-weight: 500;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid #d9d9d9;
        background-color: #ffffff;
        color: #333;

        &:hover:not(:disabled) {
          background-color: #f5f8ff;
          border-color: #003380;
          color: #003380;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .form-control {
        border: 1px solid #d9d9d9;
        border-radius: 6px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;

        &:focus {
          border-color: #003380;
        }
      }
    `,
  ],
})
export class PaginationComponent {
  pages = input.required<number>();
  currentPage = input.required<number>();

  pageChange = output<number>();

  pagesArray = computed(() => {
    const total = this.pages();
    return Array.from({ length: total > 0 ? total : 1 }, (_, i) => i + 1);
  });

  onPageChange(page: number) {
    if (page >= 1 && page <= this.pages()) {
      this.pageChange.emit(page);
    }
  }
}

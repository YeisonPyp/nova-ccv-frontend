import {
  Component,
  inject,
  OnInit,
  signal,
  output,
  input,
  HostListener,
  ElementRef,
  computed,
} from "@angular/core";
import { PaginatorComponent } from "@/app/shared/components/paginator/paginator.component";
import { CommonModule } from "@angular/common";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { Period } from "@/app/core/models/assessment/period.model";
import { PeriodService } from "@/app/core/services/assessment/period.service";

@Component({
  selector: "app-period-selector",
  imports: [CommonModule, DynamicTableComponent, PaginatorComponent],
  templateUrl: "./period-selector.component.html",
  styleUrl: "./period-selector.component.scss",
})
export class PeriodSelectorComponent implements OnInit {
  periodService = inject(PeriodService);
  elementRef = inject(ElementRef);

  selectedPeriod = input<Period | undefined>();
  onSelectPeriod = output<Period>();

  isOpen = signal<boolean>(false);

  periods = signal<Period[]>([]);
  page = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);

  columns: TableColumn<any>[] = [
    { key: "name", label: "Nombre" },
    { key: "status", label: "Estado" },
    { key: "dates", label: "Empieza/Termina" },
  ];

  mappedPeriods = computed(() =>
    this.periods().map((p) => ({
      name: p.name,
      status: p.isActive ? "Activo" : "Inactivo",
      dates: `${p.startDate}/${p.endDate}`,
      original: p,
    })),
  );

  ngOnInit() {
    this.fetchPeriods();
  }

  fetchPeriods() {
    this.periodService
      .findCurrentPeriods({ page: this.page() - 1, size: this.pageSize() })
      .subscribe((res) => {
        if (res.success && res.data) {
          this.periods.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
          if (!this.selectedPeriod() && res.data.content.length > 0) {
            this.onSelectPeriod.emit(res.data.content[0]);
          }
        }
      });
  }

  toggleOpen() {
    this.isOpen.update((v) => !v);
  }

  selectPeriod(period: Period) {
    this.onSelectPeriod.emit(period);
    this.isOpen.set(false);
  }

  handlePageChange(page: number) {
    this.page.set(page);
    this.fetchPeriods();
  }

  handlePageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
    this.fetchPeriods();
  }

  @HostListener("document:click", ["$event"])
  clickout(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}

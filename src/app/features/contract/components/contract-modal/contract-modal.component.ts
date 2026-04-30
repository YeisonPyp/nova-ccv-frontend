import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  Contract,
  ContractFilingFileName,
} from "../../../../core/models/contract/contract.models";
import { ContractFilingFileNameService } from "../../../../core/services/contract/contract-filing-file-name.service";
import { MutationsTabComponent } from "./tabs/mutations-tab/mutations-tab.component";
import { AdditionsTabComponent } from "./tabs/additions-tab/additions-tab.component";
import { CessionsTabComponent } from "./tabs/cessions-tab/cessions-tab.component";
import { SuspensionsTabComponent } from "./tabs/suspensions-tab/suspensions-tab.component";
import { CancellationsTabComponent } from "./tabs/cancellations-tab/cancellations-tab.component";
import { OthersiTabComponent } from "./tabs/othersi-tab/othersi-tab.component";

type TabKey =
  | "mutations"
  | "additions"
  | "cessions"
  | "suspensions"
  | "cancellations"
  | "othersi"
  | "filing";

interface Tab {
  key: TabKey;
  label: string;
}

@Component({
  selector: "app-contract-modal",
  standalone: true,
  imports: [
    CommonModule,
    MutationsTabComponent,
    AdditionsTabComponent,
    CessionsTabComponent,
    SuspensionsTabComponent,
    CancellationsTabComponent,
    OthersiTabComponent,
  ],
  templateUrl: "./contract-modal.component.html",
  styleUrl: "./contract-modal.component.scss",
})
export class ContractModalComponent {
  private readonly filingFileNameService = inject(
    ContractFilingFileNameService,
  );

  isOpen = input<boolean>(false);
  contract = input<Contract | null>(null);

  onClose = output<void>();
  onCreateRecord = output<TabKey>();
  onFilingSubmit = output<Record<string, File>>();

  activeTab = signal<TabKey>("mutations");
  filingFileNames = signal<ContractFilingFileName[]>([]);
  selectedFiles = signal<Record<string, File>>({});

  tabs: Tab[] = [
    { key: "mutations", label: "Mutaciones" },
    { key: "additions", label: "Adiciones" },
    { key: "cessions", label: "Cesiones" },
    { key: "suspensions", label: "Suspensiones" },
    { key: "cancellations", label: "Cancelaciones" },
    { key: "othersi", label: "Otros Sí" },
    { key: "filing", label: "Radicación" },
  ];

  contractId = computed(() => this.contract()?.id ?? 0);

  activeTabLabel = computed(
    () => this.tabs.find((t) => t.key === this.activeTab())?.label ?? "",
  );

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.filingFileNameService.findAll().subscribe((res) => {
          this.filingFileNames.set(res.data ?? []);
        });
      } else {
        this.selectedFiles.set({});
      }
    });
  }

  setTab(key: TabKey): void {
    this.activeTab.set(key);
  }

  close(): void {
    this.onClose.emit();
  }

  handleCreate(): void {
    this.onCreateRecord.emit(this.activeTab());
  }

  onFileChange(name: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFiles.update((prev) => {
      const next = { ...prev };
      if (file) next[name] = file;
      else delete next[name];
      return next;
    });
  }

  submitFiling(): void {
    this.onFilingSubmit.emit(this.selectedFiles());
  }

  formatCurrency(value: number | null): string {
    if (value == null) return "—";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  }
}

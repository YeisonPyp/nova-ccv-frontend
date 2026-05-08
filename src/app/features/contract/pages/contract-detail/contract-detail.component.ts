import {
  Component,
  computed,
  effect,
  inject,
  signal,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { MutationsTabComponent } from "./tabs/mutations-tab/mutations-tab.component";
import { AdditionsTabComponent } from "./tabs/additions-tab/additions-tab.component";
import { CessionsTabComponent } from "./tabs/cessions-tab/cessions-tab.component";
import { SuspensionsTabComponent } from "./tabs/suspensions-tab/suspensions-tab.component";
import { CancellationsTabComponent } from "./tabs/cancellations-tab/cancellations-tab.component";
import { OthersiTabComponent } from "./tabs/othersi-tab/othersi-tab.component";
import { ContractFilingFileNameService } from "../../../../core/services/contract/contract-filing-file-name.service";
import { ContractService } from "../../../../core/services/contract/contract.service";
import {
  Contract,
  ContractFilingFileName,
} from "../../../../core/models/contract/contract.models";

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
  selector: "app-contract-detail",
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
  templateUrl: "./contract-detail.component.html",
  styleUrl: "./contract-detail.component.scss",
})
export class ContractDetailComponent implements OnInit {
  private readonly filingFileNameService = inject(
    ContractFilingFileNameService,
  );
  private readonly contractService = inject(ContractService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  contract = signal<Contract | null>(null);

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
      this.filingFileNameService.findAll().subscribe((res) => {
        this.filingFileNames.set(res.data ?? []);
      });
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.contractService.findById(Number(id)).subscribe((res) => {
        if (res.success && res.data) {
          this.contract.set(res.data);
        }
      });
    }
  }

  setTab(key: TabKey): void {
    this.activeTab.set(key);
  }

  close(): void {
    this.router.navigate(["/contracts/dashboard"]);
  }

  handleCreate(): void {
    // Navigate to respective create screen based on active tab
    // e.g. this.router.navigate(["/contracts", this.contractId(), "create", this.activeTab()]);
    // For now we'll just log since the output event was used before
    console.log("Create record for:", this.activeTab());
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
    console.log("Filing submitted with files:", this.selectedFiles());
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

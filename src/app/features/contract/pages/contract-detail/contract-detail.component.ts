import { Component, computed, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { MutationsTabComponent } from "./tabs/mutations-tab/mutations-tab.component";
import { AdditionsTabComponent } from "./tabs/additions-tab/additions-tab.component";
import { CessionsTabComponent } from "./tabs/cessions-tab/cessions-tab.component";
import { SuspensionsTabComponent } from "./tabs/suspensions-tab/suspensions-tab.component";
import { CancellationsTabComponent } from "./tabs/cancellations-tab/cancellations-tab.component";
import { OthersiTabComponent } from "./tabs/othersi-tab/othersi-tab.component";
import { AssignmentsTabComponent } from "./tabs/assignments-tab/assignments-tab.component";
import { FilingCardComponent } from "../../../../features/filing/pages/filing-detail/components/filing-card/filing-card.component";
import { CreateContractProcessModalComponent } from "../create-contract-process-modal/create-contract-process-modal.component";
import { ContractPendingProcessType } from "@/app/core/models/contract/contract.models";
import { ContractService } from "@/app/core/services/contract/contract.service";
import { FilingService } from "@/app/core/services/filing/filing.service";
import { Contract } from "@/app/core/models/contract/contract.models";
import { Filing } from "@/app/core/models/filing/filing.models";

type TabKey =
  | "mutations"
  | "additions"
  | "cessions"
  | "suspensions"
  | "cancellations"
  | "othersi"
  | "assignments"
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
    AssignmentsTabComponent,
    FilingCardComponent,
    CreateContractProcessModalComponent,
  ],
  templateUrl: "./contract-detail.component.html",
  styleUrl: "./contract-detail.component.scss",
})
export class ContractDetailComponent implements OnInit {
  private readonly contractService = inject(ContractService);
  private readonly filingService = inject(FilingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  contract = signal<Contract | null>(null);
  contractFiling = signal<Filing | null>(null);
  filingLoaded = signal(false);

  activeTab = signal<TabKey>("mutations");
  showProcessModal = signal(false);

  readonly tabToProcessType: Partial<
    Record<TabKey, ContractPendingProcessType>
  > = {
    additions: "addition",
    cancellations: "cancellation",
    cessions: "cession",
    othersi: "othersi",
    suspensions: "suspension",
  };

  activeProcessType = computed<ContractPendingProcessType>(
    () => this.tabToProcessType[this.activeTab()] ?? "addition",
  );

  tabs: Tab[] = [
    { key: "mutations", label: "Mutaciones" },
    { key: "additions", label: "Adiciones" },
    { key: "cessions", label: "Cesiones" },
    { key: "suspensions", label: "Suspensiones" },
    { key: "cancellations", label: "Cancelaciones" },
    { key: "othersi", label: "Otros Sí" },
    { key: "assignments", label: "Asignaciones" },
    { key: "filing", label: "Radicación" },
  ];

  contractId = computed(() => this.contract()?.id ?? 0);

  activeTabLabel = computed(
    () => this.tabs.find((t) => t.key === this.activeTab())?.label ?? "",
  );

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
    if (key === "filing" && !this.filingLoaded()) {
      this.filingLoaded.set(true);
      this.filingService.findByContractId(this.contractId()).subscribe({
        next: (res) => {
          if (res.success && res.data) this.contractFiling.set(res.data);
        },
      });
    }
  }

  close(): void {
    this.router.navigate(["/contracts/dashboard"]);
  }

  handleCreate(): void {
    this.showProcessModal.set(true);
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

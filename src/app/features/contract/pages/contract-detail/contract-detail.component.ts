import {
  Component,
  Type,
  computed,
  inject,
  signal,
  OnInit,
} from "@angular/core";
import { CommonModule, NgComponentOutlet } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { MutationsTabComponent } from "./tabs/mutations-tab/mutations-tab.component";
import { AdditionsTabComponent } from "./tabs/additions-tab/additions-tab.component";
import { CessionsTabComponent } from "./tabs/cessions-tab/cessions-tab.component";
import { SuspensionsTabComponent } from "./tabs/suspensions-tab/suspensions-tab.component";
import { CancellationsTabComponent } from "./tabs/cancellations-tab/cancellations-tab.component";
import { OthersiTabComponent } from "./tabs/othersi-tab/othersi-tab.component";
import { AssignmentsTabComponent } from "./tabs/assignments-tab/assignments-tab.component";
import { CreateContractProcessModalComponent } from "../create-contract-process-modal/create-contract-process-modal.component";
import { ContractPendingProcessType } from "@/app/core/models/contract/contract.models";
import { ContractService } from "@/app/core/services/contract/contract.service";
import { Contract } from "@/app/core/models/contract/contract.models";
import { PendingProcessTabComponent } from "./tabs/pending-process-tab/pending-process-tab.component";
import { ResumeTabComponent } from "./tabs/resume-tab/resume-tab.component";
import { FilingUpsertComponent } from "@/app/features/filing/pages/filing-detail/components/filing-upsert/filing-upsert.component";

type TabKey =
  | "mutations"
  | "additions"
  | "cessions"
  | "suspensions"
  | "cancellations"
  | "othersi"
  | "assignments"
  | "filing"
  | "pending"
  | "resume";

interface Tab {
  key: TabKey;
  label: string;
}

@Component({
  selector: "app-contract-detail",
  standalone: true,
  imports: [
    CommonModule,
    NgComponentOutlet,
    CreateContractProcessModalComponent,
  ],
  templateUrl: "./contract-detail.component.html",
  styleUrl: "./contract-detail.component.scss",
})
export class ContractDetailComponent implements OnInit {
  private readonly contractService = inject(ContractService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  contract = signal<Contract | null>(null);

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
    resume: "resume",
  };

  readonly tabComponentMap: Record<TabKey, Type<any>> = {
    mutations: MutationsTabComponent,
    additions: AdditionsTabComponent,
    cessions: CessionsTabComponent,
    suspensions: SuspensionsTabComponent,
    cancellations: CancellationsTabComponent,
    othersi: OthersiTabComponent,
    assignments: AssignmentsTabComponent,
    pending: PendingProcessTabComponent,
    resume: ResumeTabComponent,
    filing: FilingUpsertComponent,
  };

  tabs: Tab[] = [
    { key: "mutations", label: "Mutaciones" },
    { key: "additions", label: "Adiciones" },
    { key: "cessions", label: "Cesiones" },
    { key: "suspensions", label: "Suspensiones" },
    { key: "cancellations", label: "Cancelaciones" },
    { key: "othersi", label: "Otros Sí" },
    { key: "resume", label: "Reanudaciones" },
    { key: "pending", label: "Procesos Pendientes" },
    { key: "assignments", label: "Asignaciones" },
    { key: "filing", label: "Radicación" },
  ];

  contractId = computed(() => this.contract()?.id ?? 0);

  activeTabLabel = computed(
    () => this.tabs.find((t) => t.key === this.activeTab())?.label ?? "",
  );

  activeProcessType = computed<ContractPendingProcessType>(
    () => this.tabToProcessType[this.activeTab()] ?? "addition",
  );

  activeTabComponent = computed(() => this.tabComponentMap[this.activeTab()]);
  // inject the inputs for the active tab
  activeTabInputs = computed<Record<string, unknown>>(() => {
    // for filing tab include the filing id
    if (this.activeTab() === "filing") {
      return { id: this.contract()?.filingId };
    }
    // for another tabs, include the contract id
    return { contractId: this.contractId() };
  });

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

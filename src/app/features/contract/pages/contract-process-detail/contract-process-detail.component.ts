import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ContractPendingProcessService } from "@/app/core/services/contract/contract-pending-process.service";
import {
  ContractAct,
  ContractPendingProcess,
} from "@/app/core/models/contract/contract.models";
import { Filing } from "@/app/core/models/filing/filing.models";
import { FilingUpsertComponent } from "../../../filing/pages/filing-detail/components/filing-upsert/filing-upsert.component";
import { ContractActUpsertComponent } from "./steps/contract-act-upsert/contract-act-upsert.component";
import { AdditionFormComponent } from "./steps/addition-form/addition-form.component";
import { CancellationFormComponent } from "./steps/cancellation-form/cancellation-form.component";
import { CessionFormComponent } from "./steps/cession-form/cession-form.component";
import { MutationFormComponent } from "./steps/mutation-form/mutation-form.component";
import { OthersiFormComponent } from "./steps/othersi-form/othersi-form.component";
import { SuspensionFormComponent } from "./steps/suspension-form/suspension-form.component";

@Component({
  selector: "app-contract-process-detail",
  standalone: true,
  imports: [
    CommonModule,
    FilingUpsertComponent,
    ContractActUpsertComponent,
    AdditionFormComponent,
    CancellationFormComponent,
    CessionFormComponent,
    MutationFormComponent,
    OthersiFormComponent,
    SuspensionFormComponent,
  ],
  templateUrl: "./contract-process-detail.component.html",
})
export class ContractProcessDetailComponent implements OnInit {
  private readonly processService = inject(ContractPendingProcessService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  process = signal<ContractPendingProcess | null>(null);
  contractId = signal<number>(0);

  currentStep = signal<1 | 2 | 3>(1);
  createdFiling = signal<Filing | null>(null);
  createdAct = signal<ContractAct | null>(null);
  completed = signal(false);

  stepLabels = ["Radicado", "Acta del contrato", "Registro del proceso"];

  ngOnInit(): void {
    const contractId = Number(this.route.snapshot.paramMap.get("contractId"));
    const processId = Number(this.route.snapshot.paramMap.get("processId"));
    this.contractId.set(contractId);

    this.processService
      .findByContractId(contractId, { size: 100 })
      .subscribe((res) => {
        if (res.success && res.data) {
          const found = res.data.content.find((p) => p.id === processId);
          if (found) this.process.set(found);
        }
      });
  }

  onFilingSaved(filing: Filing): void {
    this.createdFiling.set(filing);
    this.currentStep.set(2);
  }

  onActSaved(act: ContractAct): void {
    this.createdAct.set(act);
    this.currentStep.set(3);
  }

  onProcessCompleted(): void {
    this.completed.set(true);
  }

  goBack(): void {
    this.router.navigate(["/contracts", this.contractId()]);
  }
}

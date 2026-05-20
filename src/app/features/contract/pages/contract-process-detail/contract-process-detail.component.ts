import { Component, computed, inject, OnInit, signal } from "@angular/core";
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
import { ResumeFormComponent } from "./steps/resume-form/resume-form.component";

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
    ResumeFormComponent,
  ],
  templateUrl: "./contract-process-detail.component.html",
})
export class ContractProcessDetailComponent implements OnInit {
  private readonly processService = inject(ContractPendingProcessService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  process = signal<ContractPendingProcess | null>(null);
  contractId = signal<number>(0);

  currentStep = computed(() => {
    if (this.process()?.actId) return 3;
    if (this.process()?.filingId) return 2;
    return 1;
  });
  completed = signal(false);

  stepLabels = ["Radicado", "Acta del contrato", "Registro del proceso"];

  ngOnInit(): void {
    const contractId = Number(this.route.snapshot.paramMap.get("contractId"));
    const processId = Number(this.route.snapshot.paramMap.get("processId"));
    this.contractId.set(contractId);

    this.processService.findById(processId).subscribe((res) => {
      if (res.success && res.data) {
        this.process.set(res.data);
      }
    });
  }

  onFilingSaved(filing: Filing): void {
    this.processService
      .update(this.process()!.id, { filingId: filing.id })
      .subscribe((res) => {
        if (res.data && res.success) {
          res.data.filing = filing;
          res.data.filingId = filing.id;
          this.process.set(res.data);
        }
      });
  }

  onActSaved(act: ContractAct): void {
    this.processService
      .update(this.process()!.id, { actId: act.id })
      .subscribe((res) => {
        if (res.data && res.success) {
          res.data.actId = act.id;
          res.data.act = act;
          this.process.set(res.data);
        }
      });
  }

  onProcessCompleted(): void {
    this.completed.set(true);
  }

  goBack(): void {
    this.router.navigate(["/contracts", this.contractId()]);
  }

  getProcessActId() {
    const process = this.process();
    if (!process?.actId) {
      throw new Error("Process actId is not available");
    }
    return process.actId;
  }

  getProcessContractType() {
    const process = this.process();
    if (!process?.contractType) {
      throw new Error("Process contractType is not available");
    }
    return process.contractType;
  }

  getProcessFilingId() {
    const process = this.process();
    if (!process?.filingId) {
      throw new Error("Process filingId is not available");
    }
    return process.filingId;
  }
}

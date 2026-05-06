import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { BillingService } from "../../../../core/services/billing/billing.service";
import { ContractCandidate } from "../../../../core/models/billing/billing-account.model";
import {
  FileItemComponent,
  FileResource,
} from "../../../../shared/components/file-item/file-item.component";

@Component({
  selector: "app-create-billing",
  standalone: true,
  imports: [CommonModule, FileItemComponent],
  templateUrl: "./create-billing.component.html",
})
export class CreateBillingComponent implements OnInit {
  private readonly service = inject(BillingService);
  private readonly router = inject(Router);

  candidates = signal<ContractCandidate[]>([]);
  selected = signal<ContractCandidate | null>(null);
  pendingFiles = signal<File[]>([]);
  saving = signal(false);
  loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.service.getBillingCandidates().subscribe({
      next: (res) => {
        if (res.success && res.data) this.candidates.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  select(contract: ContractCandidate): void {
    this.selected.set(contract);
    this.pendingFiles.set([]);
  }

  onFileAdded(file: File): void {
    this.pendingFiles.update((list) => [...list, file]);
  }

  removeFile(index: number): void {
    this.pendingFiles.update((list) => list.filter((_, i) => i !== index));
  }

  pendingFileAsResource(file: File): FileResource {
    return {
      id: file.name,
      bucketName: "",
      fileName: file.name,
    };
  }

  submit(): void {
    const contract = this.selected();
    if (!contract) return;
    this.saving.set(true);
    this.service.create(contract.id, this.pendingFiles()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.router.navigate(["/billing/detail", res.data.id]);
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(["/billing/dashboard"]);
  }
}

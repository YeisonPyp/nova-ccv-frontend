import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuditCandidate } from "@/app/core/models/audit/audit-candidate.model";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { AuditCandidatesService } from "@/app/core/services/audit-candidates.service";
import { AuditLogsComponent } from "./audit-logs/audit-logs.component";

@Component({
  selector: "app-audit-candidates",
  standalone: true,
  imports: [CommonModule, PaginationTableComponent, AuditLogsComponent],
  templateUrl: "./audit-candidates.component.html",
})
export class AuditCandidatesComponent {
  service = inject(AuditCandidatesService);
  selectedCandidate = signal<AuditCandidate | null>(null);
  columns = computed<TableColumn[]>(() => {
    return [
      { key: "id", label: "ID" },
      { key: "name", label: "Nombre" },
      { key: "tableName", label: "Tabla" },
      {
        key: "description",
        label: "Descripción",
      },
    ];
  });

  toggleEnabled(candidate: AuditCandidate): void {
    const next = !candidate.isEnabled;
    this.service.updateCandidate(candidate.id, next).subscribe({
      next: (res) => {
        if (res.success && res.data) {
        }
      },
    });
  }

  viewLogs(candidate: AuditCandidate): void {
    this.selectedCandidate.set(candidate);
  }
}

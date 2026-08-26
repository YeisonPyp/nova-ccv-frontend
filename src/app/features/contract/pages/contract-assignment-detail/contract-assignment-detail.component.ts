import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ContractAssignmentService } from "@/app/core/services/contract/contract-assignment.service";
import { ContractSubmissionService } from "@/app/core/services/contract/contract-submission.service";
import {
  ContractAssignment,
  ContractSubmission,
} from "@/app/core/models/contract/contract.models";
import {
  FileItemComponent,
  FileResource,
} from "@/app/shared/components/file-item/file-item.component";

@Component({
  selector: "app-contract-assignment-detail",
  standalone: true,
  imports: [CommonModule, FileItemComponent],
  templateUrl: "./contract-assignment-detail.component.html",
})
export class ContractAssignmentDetailComponent implements OnInit {
  private readonly assignmentService = inject(ContractAssignmentService);
  private readonly submissionService = inject(ContractSubmissionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  assignment = signal<ContractAssignment | null>(null);
  uploading = signal(false);
  deletingId = signal<number | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.assignmentService.findById(+id).subscribe((res) => {
        if (res.success && res.data) this.assignment.set(res.data);
      });
    }
  }

  asFileResource(s: ContractSubmission): FileResource {
    return {
      id: s.id,
      bucketName: s.bucketName,
      fileName: s.fileName,
      description: s.description ?? undefined,
      createdAt: s.createdAt,
    };
  }

  onFileSelected(file: File): void {
    const a = this.assignment();
    if (!a) return;
    this.uploading.set(true);
    this.submissionService.create(a.id, [file]).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.assignment.update((prev) =>
            prev
              ? { ...prev, submissions: [...prev.submissions, res.data!] }
              : prev,
          );
        }
        this.uploading.set(false);
      },
      error: () => this.uploading.set(false),
    });
  }

  deleteSubmission(submission: ContractSubmission): void {
    this.deletingId.set(submission.id);
    this.submissionService.delete(submission.id).subscribe({
      next: () => {
        this.assignment.update((prev) =>
          prev
            ? {
                ...prev,
                submissions: prev.submissions.filter(
                  (s) => s.id !== submission.id,
                ),
              }
            : prev,
        );
        this.deletingId.set(null);
      },
      error: () => this.deletingId.set(null),
    });
  }

  goBack(): void {
    const a = this.assignment();
    if (a) this.router.navigate(["/contracts", a.contractId]);
    else this.router.navigate(["/contracts/dashboard"]);
  }
}

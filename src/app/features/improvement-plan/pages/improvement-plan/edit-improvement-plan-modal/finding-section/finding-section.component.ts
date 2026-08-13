import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FindingService } from '@/app/core/services/improvement-plan/finding.service';
import { FindingDto } from '@/app/core/models/improvement-plan/finding.model';
import { NewFindingComponent } from './new-finding/new-finding.component';
import { FindingItemComponent } from './finding-item/finding-item.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-finding-section',
  standalone: true,
  imports: [
    CommonModule,
    NewFindingComponent,
    FindingItemComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './finding-section.component.html',
  styleUrl: './finding-section.component.scss',
})
export class FindingSectionComponent implements OnInit {
  planId = input.required<number>();
  canCreate = input.required<boolean>();
  initialFindingId = input<number | null>(null);
  initialActionId = input<number | null>(null);
  service = inject(FindingService);

  isLoading = signal(false);

  findings = signal<FindingDto[]>([]);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.service.findByPlanId(this.planId()).subscribe((r) => {
      if (r.success) {
        const findings = r.data.map((f, i) => ({ ...f, number: i + 1 }));
        this.findings.set(findings);
      }
      this.isLoading.set(false);
    });
  }

  onCreated(f: FindingDto) {
    this.findings.set(
      [...this.findings(), f].map((finding, i) => ({
        ...finding,
        number: i + 1,
      })),
    );
  }

  onDeleteFinding(f: FindingDto) {
    this.findings.set(
      this.findings()
        .filter((i) => i.id !== f.id)
        .map((finding, i) => ({ ...finding, number: i + 1 })),
    );
  }
}

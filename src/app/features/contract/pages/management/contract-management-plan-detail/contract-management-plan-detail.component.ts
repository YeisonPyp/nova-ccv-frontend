import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractManagementPlanService } from '@/app/core/services/contract/contract-management-plan.service';
import { ContractManagementPlan } from '@/app/core/models/contract/contract-management-plan.model';
import { ContractManagementPlanFormComponent } from '../contract-management-plan-form/contract-management-plan-form.component';
import { ContractManagementExecutionMatrixComponent } from '../contract-management-execution-matrix/contract-management-execution-matrix.component';

@Component({
  selector: 'app-contract-management-plan-detail',
  standalone: true,
  imports: [
    CommonModule,
    ContractManagementPlanFormComponent,
    ContractManagementExecutionMatrixComponent,
  ],
  templateUrl: './contract-management-plan-detail.component.html',
})
export class ContractManagementPlanDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ContractManagementPlanService);

  planId = signal<string | null>(null);
  plan = signal<ContractManagementPlan | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.planId.set(id);
      this.loading.set(true);
      this.service.findById(id).subscribe((res) => {
        this.loading.set(false);
        if (res.success && res.data) this.plan.set(res.data);
      });
    }
  }

  onSaved(plan: ContractManagementPlan): void {
    this.plan.set(plan);
    if (!this.planId()) {
      this.planId.set(plan.id);
      this.router.navigate(['/contracts/management/plans', plan.id], {
        replaceUrl: true,
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/contracts/management']);
  }
}

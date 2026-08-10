import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FindingSectionComponent } from './finding-section/finding-section.component';
import {
  ImprovementPlanService,
  improvementPlanStatus,
} from '@/app/core/services/improvement-plan/improvement-plan.service';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { PositionService } from '@/app/core/services/assessment/position.service';
import { ControlEntityService } from '@/app/core/services/improvement-plan/control-entity.service';
import { ImprovementProcessService } from '@/app/core/services/improvement-plan/improvement-process.service';
import { SearchSelectComponent } from '@/app/shared/components/search-select/search-select.component';
import { SelectSearchComponent } from '@/app/shared/components/select-search/select-search.component';
import { SearchSelectOption } from '@/app/shared/components/search-select/on-search-select.interface';
import { ImprovementPlan } from '@/app/core/models/improvement-plan/improvement-plan.model';
import { ControlEntity } from '@/app/core/models/improvement-plan/control-entity.model';
import { ImprovementProcess } from '@/app/core/models/improvement-plan/improvement-process.model';
import { Router } from '@angular/router';
import { HasPermissionDirective } from '@/app/shared/directives/has-permission.directive';

@Component({
  selector: 'app-edit-improvement-plan-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FindingSectionComponent,
    SearchSelectComponent,
    SelectSearchComponent,
    HasPermissionDirective,
  ],
  templateUrl: './edit-improvement-plan-modal.component.html',
  styleUrl: './edit-improvement-plan-modal.component.scss',
})
export class EditImprovementPlanModalComponent {
  error = signal(null);
  private service = inject(ImprovementPlanService);
  private positionService = inject(PositionService);
  private controlEntityService = inject(ControlEntityService);
  private processService = inject(ImprovementProcessService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  positionsCtx = this.positionService.newSearchSelectContext(
    () => this.savePositions(),
    {
      maxItems: 0,
      isRequired: true,
      placeholder: 'Cargos responsables...',
      label: 'Cargos responsables',
    },
  );

  searchSelectControlEntityContext =
    this.controlEntityService.newSearchSelectControlEntityContext(
      (c) => this.updateControlEntity(c),
      {
        maxItems: 1,
        isRequired: true,
        placeholder: 'Entidad encargada',
        label: 'Entidad',
      },
    );

  searchSelectProcessContext =
    this.processService.newSearchSelectProcessContext(
      (p) => this.updateProcess(p),
      {
        maxItems: 1,
        isRequired: true,
        placeholder: 'Proceso',
        label: 'Proceso',
      },
    );

  plan = signal<ImprovementPlan | null>(null);
  id = input<number | null>(null);

  get planStatus() {
    return Object.keys(improvementPlanStatus) as Array<
      keyof typeof improvementPlanStatus
    >;
  }

  getPlanStatusName(k: keyof typeof improvementPlanStatus): string {
    return improvementPlanStatus[k];
  }

  get assignedName(): string {
    const plan = this.plan();
    if (plan == null || !plan.positions?.length) return '';
    return plan.positions.map((p) => p.name).join(', ');
  }

  isLoading = signal(false);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    expiresAt: ['', Validators.required],
    startsAt: [''],
    status: [''],
    alertDaysBeforeEnd: [3],
  });

  constructor() {
    effect(() => {
      const planId = this.id();
      if (planId) {
        this.isLoading.set(true);
        this.service.findById(planId).subscribe((res) => {
          this.plan.set(res.data);
          this.isLoading.set(false);
          const {
            name,
            description,
            status,
            expiresAt,
            controlEntity,
            positions,
            process,
            startsAt,
            alertDaysBeforeEnd,
          } = res.data;
          this.form.patchValue(
            {
              name,
              description,
              expiresAt,
              status,
              startsAt,
              alertDaysBeforeEnd: alertDaysBeforeEnd ?? 3,
            },
            { emitEvent: false },
          );
          if (positions?.length) {
            this.positionsCtx.selectResults(positions);
          }
          if (controlEntity) {
            this.searchSelectControlEntityContext.selectResults([
              controlEntity,
            ]);
          }
          if (process) {
            this.searchSelectProcessContext.selectResults([process]);
          }
          if (!this.canSetPlanProperties()) {
            this.form.disable({ emitEvent: false });
          }
          if (this.canSetStatus()) {
            this.form.get('status')?.enable({ emitEvent: false });
          }
        });

        this.form.valueChanges
          .pipe(
            debounceTime(800),
            filter(() => this.form.valid),
            distinctUntilChanged(
              (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
            ),
            switchMap((value) => this.service.update(planId, value)),
          )
          .subscribe({
            next: (next) => {
              this.plan.set(next.data);
            },
            error: (err) => console.log(err),
          });
      }
    });
  }

  canSetStatus() {
    if (!this.id()) return true;
    const p = this.plan();
    return p?.permissions?.includes('SET_STATUS') || false;
  }

  canSetPlanProperties() {
    if (!this.id()) return true;
    const p = this.plan();
    return p?.permissions?.includes('UPDATE_PLAN_PROPERTIES') || false;
  }

  canCreateFindings() {
    return this.plan()?.permissions?.includes('CREATE_FINDINGS') || false;
  }

  onRemovePosition(p: SearchSelectOption) {
    this.positionsCtx.remove(p);
    this.savePositions();
  }

  private savePositions() {
    const p = this.plan();
    if (!p) return;
    this.service
      .update(p.id, {
        positionIds: this.positionsCtx
          .selectedOptions()
          .map((o) => o.id as number),
      })
      .subscribe((r) => {
        if (r.success && r.data) {
          this.plan.set(r.data);
        }
      });
  }

  updateControlEntity(c: ControlEntity) {
    const p = this.plan();
    if (p && c.id !== p.controlEntityId) {
      this.service
        .update(p.id, {
          controlEntityId: c.id,
        })
        .subscribe((r) => {
          if (r.success && r.data) {
            this.plan.set(r.data);
          }
        });
    }
  }

  updateProcess(process: ImprovementProcess) {
    const p = this.plan();
    if (p && process.id !== p.process?.id) {
      this.service
        .update(p.id, {
          processId: process.id,
        })
        .subscribe((r) => {
          if (r.success && r.data) {
            this.plan.set(r.data);
          }
        });
    }
  }

  onSavePlan() {
    const p = this.plan();
    const controlEntity =
      this.searchSelectControlEntityContext.selectedOptions()[0];
    const process = this.searchSelectProcessContext.selectedOptions()[0];
    const { description, expiresAt, name, startsAt, alertDaysBeforeEnd } =
      this.form.value;
    const controlEntityId = controlEntity?.id as number;
    const controlEntityName = controlEntity.title;
    const processId = process?.id as number;
    if (p) {
      this.service
        .update(p.id, {
          controlEntityId,
          controlEntityName,
          processId,
          description,
          expiresAt,
          name,
        })
        .subscribe((p) => {
          this.plan.set(p.data);
          this.goBack();
        });
    } else {
      this.service
        .create({
          controlEntityId,
          processId,
          positionIds: this.positionsCtx
            .selectedOptions()
            .map((o) => o.id as number),
          alertDaysBeforeEnd,
          description,
          expiresAt,
          startsAt,
          name,
        })
        .subscribe((p) => {
          this.plan.set(p.data);
          this.goBack();
        });
    }
  }

  goBack(): void {
    this.router.navigate(['improvement-plan']);
  }
}

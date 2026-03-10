import { Component, inject, OnInit, signal } from "@angular/core";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../shared/components/dynamic-table/dynamic-table.component";
import { ImpactRule } from "../../../../../core/models/assessment/impact-rule.model";
import { PaginatorComponent } from "../../../../../shared/components/paginator/paginator.component";
import {
  CreateRuleDto,
  ImpactRuleService,
  UpdateRuleDto,
} from "../../../../../core/services/assessment/impact-rule.service";
import { CommonModule } from "@angular/common";
import { ImpactRuleModalComponent } from "./impact-rule-modal/impact-rule-modal.component";

@Component({
  selector: "app-impact-rules-dashboard",
  imports: [
    CommonModule,
    DynamicTableComponent,
    PaginatorComponent,
    ImpactRuleModalComponent,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  columns: TableColumn<ImpactRule>[] = [
    { key: "name", label: "Nombre" },
    { key: "impactFactor", label: "Factor de ponderación (%)" },
    { key: "competencies", label: "Competencias" },
  ];

  size = signal<number>(20);
  page = signal<number>(0);
  totalPages = signal<number>(0);
  rules = signal<ImpactRule[]>([]);

  isModalOpen = signal(false);
  isEdit = signal(false);
  selectedRule = signal<ImpactRule | null>(null);

  service = inject(ImpactRuleService);

  ngOnInit(): void {
    this.fetchRules();
  }

  private fetchRules() {
    this.service
      .findRules({ page: this.page(), size: this.size() })
      .subscribe((res) => {
        if (res.data && res.data.content) {
          this.rules.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        }
      });
  }

  openCreateModal() {
    this.isEdit.set(false);
    this.selectedRule.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(rule: ImpactRule) {
    this.isEdit.set(true);
    this.selectedRule.set(rule);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedRule.set(null);
  }

  onSaveRules(payload: CreateRuleDto | UpdateRuleDto) {
    if (this.isEdit() && this.selectedRule()) {
      // Handle Single Update
      this.service
        .updateRule(this.selectedRule()!.id, payload as UpdateRuleDto)
        .subscribe({
          next: () => {
            this.closeModal();
            this.fetchRules();
          },
          error: (err) => {
            console.error("Failed to update impact rule", err);
          },
        });
    } else {
      // Handle Creation
      this.service.createRule(payload as CreateRuleDto).subscribe({
        next: () => {
          this.closeModal();
          this.fetchRules();
        },
        error: (err) => {
          console.error("Failed to create impact rules", err);
        },
      });
    }
  }

  onDeleteRule(rule: ImpactRule) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar la regla de impacto "${rule.name}"?`,
      )
    ) {
      this.service.deleteRule(rule.id).subscribe({
        next: () => {
          this.fetchRules();
        },
        error: (err) => {
          console.error("Failed to delete impact rule", err);
        },
      });
    }
  }

  buildCompetenciesString(competencies?: Array<{ name: string }>): string {
    if (!competencies || competencies.length === 0) {
      return "N/A";
    }
    return competencies.map((c) => c.name).join(", ");
  }

  onSizeChange(n: number) {
    this.size.set(n);
    this.page.set(1);
    this.fetchRules();
  }

  onPageChange(n: number) {
    this.page.set(n);
    this.fetchRules();
  }
}

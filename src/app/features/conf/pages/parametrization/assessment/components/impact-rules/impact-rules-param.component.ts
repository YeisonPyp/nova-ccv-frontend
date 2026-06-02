import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { ImpactRuleService } from "@/app/core/services/assessment/impact-rule.service";
import { ImpactRule } from "@/app/core/models/assessment/impact-rule.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
import { ParametrizationSectionComponent } from "@/app/features/conf/components/parametrization-section.component";

@Component({
  selector: "app-impact-rules-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
  ],
  templateUrl: "./impact-rules-param.component.html",
})
export class ImpactRulesParamComponent {
  private readonly auth = inject(AuthService);
  private readonly impactRuleService = inject(ImpactRuleService);

  impactRules = signal<ImpactRule[]>([]);
  impactRulePage = signal(1);
  impactRuleSize = signal(10);
  impactRuleTotalPages = signal(0);
  impactRulesLoaded = signal(false);

  impactRuleModalMode = signal<"create" | "update" | null>(null);
  showDeleteImpactRuleModal = signal(false);
  editingImpactRule = signal<ImpactRule | null>(null);

  impactRuleForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    impactFactor: new FormControl<number | null>(null, [Validators.required]),
  });

  impactRuleColumns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "impactFactor", label: "Factor de impacto" },
  ];

  get canReadImpactRule() {
    return this.auth.hasPermission("COMPETENCIE_IMPACT_RULE_READ");
  }
  get canCreateImpactRule() {
    return this.auth.hasPermission("COMPETENCIE_IMPACT_RULE_CREATE");
  }
  get canUpdateImpactRule() {
    return this.auth.hasPermission("COMPETENCIE_IMPACT_RULE_UPDATE");
  }
  get canDeleteImpactRule() {
    return this.auth.hasPermission("COMPETENCIE_IMPACT_RULE_DELETE");
  }

  onImpactRulesToggle(event: Event) {
    if (
      (event.target as HTMLDetailsElement).open &&
      !this.impactRulesLoaded()
    ) {
      this.loadImpactRules(1);
    }
  }

  loadImpactRules(page: number) {
    this.impactRulePage.set(page);
    this.impactRulesLoaded.set(true);
    this.impactRuleService
      .findRules({ page: page - 1, size: this.impactRuleSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.impactRules.set(res.data.content);
            this.impactRuleTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.impactRulesLoaded.set(false),
      });
  }

  openCreateImpactRule() {
    this.impactRuleForm.reset({ name: "", impactFactor: null });
    this.editingImpactRule.set(null);
    this.impactRuleModalMode.set("create");
  }

  openEditImpactRule(item: ImpactRule) {
    this.impactRuleForm.reset({
      name: item.name,
      impactFactor: item.impactFactor,
    });
    this.editingImpactRule.set(item);
    this.impactRuleModalMode.set("update");
  }

  closeImpactRuleModal() {
    this.impactRuleModalMode.set(null);
  }

  submitImpactRule() {
    if (this.impactRuleForm.invalid) return;
    const { name, impactFactor } = this.impactRuleForm.value;
    const mode = this.impactRuleModalMode();
    if (mode === "create") {
      this.impactRuleService
        .createRule({
          name: name!,
          impactFactor: impactFactor!,
          competencieIds: [],
        })
        .subscribe({
          next: () => {
            this.closeImpactRuleModal();
            this.loadImpactRules(this.impactRulePage());
          },
        });
    } else if (mode === "update") {
      const item = this.editingImpactRule()!;
      this.impactRuleService
        .updateRule(item.id, { name: name!, impactFactor: impactFactor! })
        .subscribe({
          next: () => {
            this.closeImpactRuleModal();
            this.loadImpactRules(this.impactRulePage());
          },
        });
    }
  }

  openDeleteImpactRule(item: ImpactRule) {
    this.editingImpactRule.set(item);
    this.showDeleteImpactRuleModal.set(true);
  }

  closeDeleteImpactRuleModal() {
    this.showDeleteImpactRuleModal.set(false);
    this.editingImpactRule.set(null);
  }

  confirmDeleteImpactRule() {
    const item = this.editingImpactRule();
    if (!item) return;
    this.impactRuleService.deleteRule(item.id).subscribe({
      next: () => {
        this.closeDeleteImpactRuleModal();
        this.loadImpactRules(this.impactRulePage());
      },
    });
  }
}

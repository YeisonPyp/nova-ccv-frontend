import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { CompetencieService } from "../../../../../../../core/services/assessment/competencie.service";
import { Competencie } from "../../../../../../../core/models/assessment/competencie.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-competencies-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
  ],
  templateUrl: "./competencies-param.component.html",
  styles: [
    `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .modal-overlay {
        position: fixed; inset: 0; z-index: 50;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      }
      .modal-box {
        background: #fff; border-radius: 12px; padding: 24px;
        width: 100%; max-width: 480px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        animation: slideUp 0.2s ease-out;
      }
      .modal-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; }
      .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
    `,
  ],
})
export class CompetenciesParamComponent {
  private readonly auth = inject(AuthService);
  private readonly competencieService = inject(CompetencieService);

  competencies = signal<Competencie[]>([]);
  competenciePage = signal(1);
  competencieSize = signal(10);
  competencieTotalPages = signal(0);
  competenciesLoaded = signal(false);

  competencieModalMode = signal<"create" | "update" | null>(null);
  showDeleteCompetencieModal = signal(false);
  editingCompetenie = signal<Competencie | null>(null);

  competencieForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    type: new FormControl("", [Validators.required]),
    description: new FormControl("", [Validators.required]),
    minScore: new FormControl<number>(0),
    maxScore: new FormControl<number>(5),
  });

  competencieColumns: TableColumn<Competencie>[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  competencyTypeOptions = [
    { value: "BEHAVIORAL", label: "Conductual" },
    { value: "TECHNICAL", label: "Técnica" },
    { value: "CORE", label: "Core" },
  ];

  get canReadCompetenie() { return this.auth.hasPermission("COMPETENCIE_READ"); }
  get canCreateCompetenie() { return this.auth.hasPermission("COMPETENCIE_CREATE"); }
  get canUpdateCompetenie() { return this.auth.hasPermission("COMPETENCIE_UPDATE"); }
  get canDeleteCompetenie() { return this.auth.hasPermission("COMPETENCIE_DELETE"); }

  onCompetenciesToggle(event: Event) {
    if ((event.target as HTMLDetailsElement).open && !this.competenciesLoaded()) {
      this.loadCompetencies(1);
    }
  }

  loadCompetencies(page: number) {
    this.competenciePage.set(page);
    this.competenciesLoaded.set(true);
    this.competencieService
      .getCompetencies({ page: page - 1, size: this.competencieSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.competencies.set(res.data.content);
            this.competencieTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.competenciesLoaded.set(false),
      });
  }

  openCreateCompetenie() {
    this.competencieForm.reset({ name: "", type: "", description: "", minScore: 0, maxScore: 5 });
    this.editingCompetenie.set(null);
    this.competencieModalMode.set("create");
  }

  openEditCompetenie(item: Competencie) {
    this.competencieForm.reset({
      name: item.name,
      type: (item as any).type ?? "",
      description: item.description ?? "",
      minScore: (item as any).minScore ?? 0,
      maxScore: (item as any).maxScore ?? 5,
    });
    this.editingCompetenie.set(item);
    this.competencieModalMode.set("update");
  }

  closeCompetencieModal() { this.competencieModalMode.set(null); }

  submitCompetenie() {
    if (this.competencieForm.invalid) return;
    const { name, type, description, minScore, maxScore } = this.competencieForm.value;
    const dto = {
      name: name!, type: type! as any, description: description!,
      minScore: minScore ?? 0, maxScore: maxScore ?? 5, positions: [],
    };
    const mode = this.competencieModalMode();
    if (mode === "create") {
      this.competencieService.createCompetency(dto).subscribe({
        next: () => { this.closeCompetencieModal(); this.loadCompetencies(this.competenciePage()); },
      });
    } else if (mode === "update") {
      const item = this.editingCompetenie()!;
      this.competencieService.updateCompetency(item.id, dto).subscribe({
        next: () => { this.closeCompetencieModal(); this.loadCompetencies(this.competenciePage()); },
      });
    }
  }

  openDeleteCompetenie(item: Competencie) {
    this.editingCompetenie.set(item);
    this.showDeleteCompetencieModal.set(true);
  }

  closeDeleteCompetencieModal() {
    this.showDeleteCompetencieModal.set(false);
    this.editingCompetenie.set(null);
  }

  confirmDeleteCompetenie() {
    const item = this.editingCompetenie();
    if (!item) return;
    this.competencieService.deleteCompetency(item.id).subscribe({
      next: () => { this.closeDeleteCompetencieModal(); this.loadCompetencies(this.competenciePage()); },
    });
  }
}

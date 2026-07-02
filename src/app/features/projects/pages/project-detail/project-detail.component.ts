import {
  Component,
  OnInit,
  Type,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  NgComponentOutlet,
} from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '@/app/core/services/projects/project.service';
import {
  Project,
  ProjectStatus,
} from '@/app/core/models/projects/project.model';
import { RisksSectionComponent } from './components/risks-section/risks-section.component';
import { ActivitesSectionComponent } from './components/activities-section/activities-section.component';
import { ProductsTabComponent } from './components/products-tab/products-tab.component';
import { BudgetTabComponent } from './components/budget-tab/budget-tab.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

type TabKeys = 'products' | 'activities' | 'risks' | 'budget';
interface Tab {
  key: TabKeys;
  label: string;
}
@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RisksSectionComponent,
    ActivitesSectionComponent,
    NgComponentOutlet,
    LoadingSpinnerComponent,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ProjectService);

  project = signal<Project | null>(null);
  loading = signal(true);
  ganttLoading = signal(true);
  error = signal<string | null>(null);

  tabComponents: Record<TabKeys, Type<any>> = {
    products: ProductsTabComponent,
    activities: ActivitesSectionComponent,
    budget: BudgetTabComponent,
    risks: RisksSectionComponent,
  };

  tabs: Tab[] = [
    { key: 'products', label: 'Productos' },
    { key: 'activities', label: 'Actividades' },
    { key: 'budget', label: 'Presupuesto' },
    { key: 'risks', label: 'Riesgos' },
  ];

  activeTab = signal<TabKeys>('activities');

  tabInputs = computed<Record<TabKeys, Record<string, unknown>>>(() => {
    const project = this.project();

    const base = { projectId: project?.id };

    return {
      products: base,
      activities: base,
      budget: base,
      risks: base,
    };
  });

  activeTabComponent = computed<Type<any>>(
    () => this.tabComponents[this.activeTab()],
  );
  activeTabInputs = computed<Record<string, unknown>>(
    () => this.tabInputs()[this.activeTab()],
  );

  ngOnInit(): void {
    const projectId = Number(this.route.snapshot.paramMap.get('id'));

    this.service.findById(projectId).subscribe({
      next: (res) => {
        if (res.success) this.project.set(res.data);
        else this.error.set(res.message);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el proyecto');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  getStatusClass(status: ProjectStatus): string {
    const map: Record<string, string> = {
      ACTIVO: 'badge-success',
      FINALIZADO: 'badge-secondary',
      SUSPENDIDO: 'badge-warning',
      CANCELADO: 'badge-danger',
      PLANEACION: 'badge-info',
    };
    return map[status.name?.toUpperCase()] ?? 'badge-secondary';
  }
}

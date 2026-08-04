import {
  Component,
  OnInit,
  Type,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, NgComponentOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';
import { PatActivity } from '@/app/core/models/pat/pat-models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { PatBudgetTabComponent } from './components/budget-tab/budget-tab.component';
import { PatExecutionTabComponent } from './components/execution-tab/execution-tab.component';
import { PatIndicatorsTabComponent } from './components/indicators-tab/indicators-tab.component';
import { PatProductsTabComponent } from './components/products-tab/products-tab.component';
import { PatBenefitsTabComponent } from './components/benefits-tab/benefits-tab.component';

type TabKeys = 'budget' | 'execution' | 'indicators' | 'products' | 'benefits';
interface Tab {
  key: TabKeys;
  label: string;
}

@Component({
  selector: 'app-pat-activity-detail',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    NgComponentOutlet,
    LoadingSpinnerComponent,
  ],
  templateUrl: './activity-detail.component.html',
})
export class PatActivityDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(PatActivityService);

  activity = signal<PatActivity | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  tabComponents: Record<TabKeys, Type<any>> = {
    budget: PatBudgetTabComponent,
    execution: PatExecutionTabComponent,
    indicators: PatIndicatorsTabComponent,
    products: PatProductsTabComponent,
    benefits: PatBenefitsTabComponent,
  };

  tabs: Tab[] = [
    { key: 'budget', label: 'Presupuesto' },
    { key: 'execution', label: 'Ejecución' },
    { key: 'indicators', label: 'Indicadores' },
    { key: 'products', label: 'Productos' },
    { key: 'benefits', label: 'Beneficios' },
  ];

  activeTab = signal<TabKeys>('budget');

  tabInputs = computed<Record<TabKeys, Record<string, unknown>>>(() => {
    const activity = this.activity();
    const base = { activityId: activity?.id };
    return {
      budget: base,
      execution: base,
      indicators: base,
      products: base,
      benefits: base,
    };
  });

  activeTabComponent = computed<Type<any>>(
    () => this.tabComponents[this.activeTab()],
  );
  activeTabInputs = computed<Record<string, unknown>>(
    () => this.tabInputs()[this.activeTab()],
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.service.findById(id).subscribe({
      next: (res) => {
        if (res.success) this.activity.set(res.data);
        else this.error.set(res.message);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la actividad');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    const year = this.activity()?.year;
    this.router.navigate([`/pat/${year}/dashboard`]);
  }
}

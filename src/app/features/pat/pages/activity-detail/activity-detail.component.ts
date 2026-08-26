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
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';
import { PatActivity } from '@/app/core/models/pat/pat-models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { PatTasksTabComponent } from './components/tasks-tab/tasks-tab.component';
import { PatIndicatorsSummaryTabComponent } from './components/indicators-summary-tab/indicators-summary-tab.component';
import { PatProductsSummaryTabComponent } from './components/products-summary-tab/products-summary-tab.component';
import { PatBenefitsSummaryTabComponent } from './components/benefits-summary-tab/benefits-summary-tab.component';

type TabKeys = 'tasks' | 'indicators' | 'products' | 'benefits';
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
    tasks: PatTasksTabComponent,
    indicators: PatIndicatorsSummaryTabComponent,
    products: PatProductsSummaryTabComponent,
    benefits: PatBenefitsSummaryTabComponent,
  };

  tabs: Tab[] = [
    { key: 'tasks', label: 'Tareas' },
    { key: 'indicators', label: 'Indicadores' },
    { key: 'products', label: 'Productos' },
    { key: 'benefits', label: 'Impactos' },
  ];

  activeTab = signal<TabKeys>('tasks');

  tabInputs = computed<Record<TabKeys, Record<string, unknown>>>(() => {
    const activity = this.activity();
    const base = { activityId: activity?.id };
    return {
      tasks: { ...base, year: activity?.year },
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

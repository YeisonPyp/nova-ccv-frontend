import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { FindingService } from '@/app/core/services/improvement-plan/finding.service';
import {
  FindingDto,
  FindingType,
  findingTypeLabels,
} from '@/app/core/models/improvement-plan/finding.model';
import { FindingDocumentDto } from '@/app/core/models/improvement-plan/finding-document.model';
import { FindingDocumentItemComponent } from '@/app/features/improvement-plan/pages/improvement-plan/components/finding-document-item/finding-document-item.component';
import { ActionSectionComponent } from './action-section/action-section.component';
import { AutosizeTextareaDirective } from '@/app/shared/directives/autosize-textarea.directive';

@Component({
  selector: 'app-finding-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FindingDocumentItemComponent,
    ActionSectionComponent,
    AutosizeTextareaDirective,
  ],
  templateUrl: './finding-item.component.html',
  styleUrl: './finding-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindingItemComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FindingService);

  finding = input.required<FindingDto>();

  onDelete = output<FindingDto>();

  actions = computed(() => this.finding().actions ?? []);

  rootCauseDocuments = signal<FindingDocumentDto[]>([]);

  formGroup: FormGroup;

  get findingTypes(): FindingType[] {
    return Object.keys(findingTypeLabels) as FindingType[];
  }

  getFindingTypeLabel(type: FindingType): string {
    return findingTypeLabels[type];
  }

  constructor() {
    this.formGroup = this.fb.group({
      type: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', Validators.required],
      rootCauseNotes: [''],
    });

    toObservable(this.finding).subscribe((f) => {
      this.rootCauseDocuments.set(f.rootCauseDocuments ?? []);
      this.formGroup.patchValue(
        {
          type: f.type,
          name: f.name,
          description: f.description,
          rootCauseNotes: f.rootCauseNotes,
        },
        { emitEvent: false },
      );
    });
  }

  ngOnInit(): void {
    this.formGroup.valueChanges
      .pipe(
        debounceTime(800),
        filter(() => this.formGroup.valid),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
        switchMap((values) => this.service.update(this.finding().id, values)),
      )
      .subscribe({
        error: (err) => console.error('Error al guardar el hallazgo:', err),
      });
  }

  onDeleteFinding(): void {
    this.service.deleteById(this.finding().id).subscribe((r) => {
      if (r.success) this.onDelete.emit(r.data);
    });
  }

  onSaveDocument(doc: FindingDocumentDto) {
    const docs = this.rootCauseDocuments().reduce(
      (prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      },
      {} as Record<number, FindingDocumentDto>,
    );
    docs[doc.id] = doc;
    this.rootCauseDocuments.set(Object.values(docs));
  }

  onRemoveDocument(doc: FindingDocumentDto) {
    this.rootCauseDocuments.set(
      this.rootCauseDocuments().filter((d) => d.id !== doc.id),
    );
  }
}

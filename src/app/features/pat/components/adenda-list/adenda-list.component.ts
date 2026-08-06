import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, output, signal } from '@angular/core';
import { PatAdendaService } from '@/app/core/services/pat/pat-adenda.service';
import { PatAdenda } from '@/app/core/models/pat/pat-models';
import { AdendaUpsertModalComponent } from './components/adenda-upsert-modal.component';
import { EditIconComponent } from '@/app/shared/components/edit-icon/edit-icon.component';

@Component({
  selector: 'app-adenda-list',
  standalone: true,
  imports: [CommonModule, AdendaUpsertModalComponent, EditIconComponent],
  templateUrl: './adenda-list.component.html',
})
export class AdendaListComponent implements OnInit {
  private readonly service = inject(PatAdendaService);

  adendas = signal<PatAdenda[]>([]);
  selectedId = signal<number | null>(null);
  loading = signal(false);

  modalOpen = signal(false);
  editing = signal<PatAdenda | null>(null);

  readonly onSelect = output<PatAdenda | null>();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.findAll({ page: 0, size: 200 }).subscribe((res) => {
      this.loading.set(false);
      if (res.success && res.data) {
        this.adendas.set(res.data.content);
        if (this.selectedId() == null && res.data.content.length) {
          this.select(res.data.content[0]);
        }
      }
    });
  }

  select(adenda: PatAdenda): void {
    this.selectedId.set(adenda.id);
    this.onSelect.emit(adenda);
  }

  openCreate(): void {
    this.editing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(adenda: PatAdenda, event: Event): void {
    event.stopPropagation();
    this.editing.set(adenda);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editing.set(null);
  }

  onSaved(): void {
    this.closeModal();
    this.load();
  }
}

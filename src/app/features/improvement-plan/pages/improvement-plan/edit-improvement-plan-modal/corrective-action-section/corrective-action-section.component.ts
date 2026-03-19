import { CommonModule } from "@angular/common";
import { Component, inject, Input, input, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { EvidenceItemComponent } from "../../components/evidence-item/evidence-item.component";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { combineLatest, map, of, switchMap } from "rxjs";
import { CorrectiveActionService } from "../../../../../../core/services/improvement-plan/corrective-action.service";

@Component({
  selector: "app-corrective-action-section",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EvidenceItemComponent,
    CorrectiveActionSectionComponent,
  ],
  templateUrl: "./corrective-action-section.component.html",
  styleUrl: "./corrective-action-section.component.scss",
})
export class CorrectiveActionSectionComponent {
  parentId = input.required<number>();
  childActions = input(0);
  private isOpen = signal(false);
  service = inject(CorrectiveActionService);

  actions = toSignal(
    combineLatest([
      toObservable(this.parentId),
      toObservable(this.isOpen)
    ]).pipe(
      switchMap(([id, open]) => {
        if (!open || !id) {
          return of([]);
        }
        return this.service.findByParentId(id).pipe(
          map(response => response.data)
        );
      })
    ),
    { initialValue: [] }
  );

  onToggle(event: Event) {
    this.isOpen.set((event.target as HTMLDetailsElement).open);
  }
}

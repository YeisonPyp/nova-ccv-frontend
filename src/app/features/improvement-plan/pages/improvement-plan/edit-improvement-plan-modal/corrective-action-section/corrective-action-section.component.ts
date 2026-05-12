import { CommonModule } from "@angular/common";
import {
  Component,
  effect,
  forwardRef,
  inject,
  Input,
  input,
  signal,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { combineLatest, map, of, switchMap } from "rxjs";
import { CorrectiveActionService } from "@/app/core/services/improvement-plan/corrective-action.service";
import { NewCorrectiveActionComponent } from "./new-corrective-action/new-corrective-action.component";
import { CorrectiveActionDto } from "@/app/core/models/improvement-plan/corrective-action.model";
import { CorrectiveActionDetailsComponent } from "./corrective-action-details/corrective-action-details.component";

@Component({
  selector: "app-corrective-action-section",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NewCorrectiveActionComponent,
    CorrectiveActionDetailsComponent,
  ],
  templateUrl: "./corrective-action-section.component.html",
  styleUrl: "./corrective-action-section.component.scss",
})
export class CorrectiveActionSectionComponent {
  parentId = input<number>();
  planId = input.required<number>();
  childActions = input(1);
  private isOpen = signal(false);
  service = inject(CorrectiveActionService);

  actions = signal<CorrectiveActionDto[]>([]);

  constructor() {
    const t = toSignal(
      combineLatest([
        toObservable(this.parentId),
        toObservable(this.planId),
        toObservable(this.isOpen),
      ]).pipe(
        switchMap(([id, planId, open]) => {
          if (!open || !planId) {
            return of([]);
          }
          return this.service
            .findByParentId(planId, id)
            .pipe(map((response) => response.data));
        }),
      ),
    );

    toObservable(t).subscribe((e) => {
      if (e) this.actions.set(e);
    });
  }

  onToggle(event: Event) {
    this.isOpen.set((event.target as HTMLDetailsElement).open);
  }

  onCreated(c: CorrectiveActionDto) {
    this.actions.set([...this.actions(), c]);
  }

  onDeleteCorrectiveAction(a: CorrectiveActionDto) {
    this.actions.set([...this.actions().filter((i) => i.id !== a.id)]);
  }
}

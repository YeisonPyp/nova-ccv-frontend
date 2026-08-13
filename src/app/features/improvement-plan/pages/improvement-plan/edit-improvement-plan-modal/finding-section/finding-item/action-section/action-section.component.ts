import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ImprovementActionService } from '@/app/core/services/improvement-plan/improvement-action.service';
import { NewActionComponent } from './new-action/new-action.component';
import { ImprovementActionDto } from '@/app/core/models/improvement-plan/improvement-action.model';
import { FindingType } from '@/app/core/models/improvement-plan/finding.model';
import { ActionDetailsComponent } from './action-details/action-details.component';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

@Component({
  selector: 'app-action-section',
  standalone: true,
  imports: [CommonModule, NewActionComponent, ActionDetailsComponent],
  templateUrl: './action-section.component.html',
  styleUrl: './action-section.component.scss',
})
export class ActionSectionComponent implements OnInit {
  findingId = input.required<number>();
  findingType = input.required<FindingType>();

  actions = input.required<ImprovementActionDto[]>();
  $actions = signal<ImprovementActionDto[]>([]);

  constructor() {}

  ngOnInit(): void {
    this.$actions.set(this.withLetters(this.actions()));
  }

  private withLetters(actions: ImprovementActionDto[]): ImprovementActionDto[] {
    return actions.map((a, i) => ({
      ...a,
      letter: LETTERS[i % LETTERS.length],
    }));
  }

  onCreated(a: ImprovementActionDto) {
    this.$actions.set(this.withLetters([...this.$actions(), a]));
  }

  onDeleteAction(a: ImprovementActionDto) {
    this.$actions.set(
      this.withLetters(this.$actions().filter((i) => i.id !== a.id)),
    );
  }

  onActionUpdated(updated: ImprovementActionDto) {
    this.$actions.set(
      this.$actions().map((a) =>
        a.id === updated.id ? { ...updated, letter: a.letter } : a,
      ),
    );
  }
}

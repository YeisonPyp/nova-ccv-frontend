import { Component, computed, input } from '@angular/core';

interface AssessmentTypes {
  [k: string]: {
    $class: string;
    text: string;
  };
}

@Component({
  selector: 'span[app-assessment-type]',
  template: `{{ tName().text }}`,
  host: {
    '[class]': '$class()',
  },
})
export class AssessmentTypeComponent {
  t = input.required<string>();

  private readonly base =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset';

  m: AssessmentTypes = {
    SELF: {
      $class: 'bg-blue-50 text-blue-700 ring-blue-200',
      text: 'AUTOEVALUACIÓN',
    },
    PEER: {
      $class: 'bg-amber-50 text-amber-700 ring-amber-200',
      text: 'PARES',
    },
    HIERARCHICAL: {
      $class: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
      text: 'JERARQUICA',
    },
    SUPERIOR: {
      $class: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      text: 'SUPERIOR',
    },
  };

  tName = computed(() => {
    return this.m[this.t()] ?? this.m['SELF'];
  });

  $class = computed(() => {
    return `${this.base} ${this.tName().$class}`;
  });
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indicatorTypeLabel',
  standalone: true,
})
export class IndicatorTypeLabelPipe implements PipeTransform {
  private readonly map: Record<string, string> = {
    management: 'Gestión',
    result: 'Resultado',
  };

  transform(value: string | undefined | null): string {
    if (!value) return '—';
    return this.map[value.toLowerCase()] ?? value;
  }
}

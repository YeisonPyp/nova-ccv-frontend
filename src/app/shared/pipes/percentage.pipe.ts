import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentage',
  standalone: true
})
export class PercentagePipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 1): string {
    if (value === null || value === undefined) {
      return '0%';
    }
    return `${value.toFixed(decimals)}%`;
  }
}

@Pipe({
  name: 'currencyCop',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '$0';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
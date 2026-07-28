import { Component, input, signal } from '@angular/core';
import { TableColumn } from '../dynamic-table.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-table-exporter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dynamic-table-exporter.component.html',
})
export class DynamicTableExporterComponent<T> {
  data = input.required<T[]>();
  columns = input.required<TableColumn[]>();
  /** Feedback after copying to the clipboard. */
  copied = signal(false);
  /** Base name used for the downloaded CSV file. */
  fileName = input<string>('tabla');

  /** Cell value as plain text, mirroring what the table renders. */
  private cellValue(item: any, col: TableColumn): string {
    const value = col.valueCallBack
      ? col.valueCallBack(item)
      : col.key
          .split('.')
          .reduce((acc: any, key) => (acc == null ? acc : acc[key]), item);
    return value === null || value === undefined ? '' : String(value);
  }

  /** Rows as a matrix (headers + data), excluding the actions column. */
  private buildRows(): string[][] {
    const cols = this.columns();
    return [
      cols.map((c) => c.label),
      ...this.data().map((item) => cols.map((c) => this.cellValue(item, c))),
    ];
  }

  /** Tab-separated: pasting this into Excel splits it into columns. */
  private toTsv(): string {
    return this.buildRows()
      .map((row) => row.map((c) => c.replace(/[\t\r\n]+/g, ' ')).join('\t'))
      .join('\n');
  }

  private toCsv(): string {
    const escape = (cell: string) =>
      /[",\r\n;]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
    return this.buildRows()
      .map((row) => row.map(escape).join(';'))
      .join('\r\n');
  }

  /** Copies the table so it can be pasted straight into a spreadsheet. */
  async copyToClipboard(): Promise<void> {
    if (!this.data().length) return;
    try {
      await navigator.clipboard.writeText(this.toTsv());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.copied.set(false);
    }
  }

  /** Downloads the current table data as CSV (no actions column). */
  exportCsv(): void {
    if (!this.data().length) return;
    // BOM so Excel opens accented characters correctly
    const blob = new Blob(['﻿' + this.toCsv()], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.fileName()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

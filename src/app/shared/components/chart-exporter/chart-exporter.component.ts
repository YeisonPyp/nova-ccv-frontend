import { CommonModule } from '@angular/common';
import { Component, ContentChild, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx';

/**
 * Wraps a ng2-charts canvas and adds "download PNG" / "download Excel"
 * buttons on top of it.
 *
 * Usage:
 * <app-chart-exporter fileName="metricas">
 *   <canvas baseChart type="bar" [data]="data()" [options]="options"></canvas>
 * </app-chart-exporter>
 */
@Component({
  selector: 'app-chart-exporter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-exporter.component.html',
})
export class ChartExporterComponent {
  /** Chart directive projected through ng-content. */
  @ContentChild(BaseChartDirective) chartDirective?: BaseChartDirective;

  fileName = input<string>('grafico-exportado');
  excelSheetName = input<string>('Datos');
  /** Optional heading rendered next to the buttons. */
  title = input<string>('');

  // ── PNG ───────────────────────────────────────────────────────────────────

  exportToPNG(): void {
    const chart = this.chartDirective?.chart;
    if (!chart) {
      console.error('No se encontró ninguna instancia de Chart.js');
      return;
    }

    // Chart.js renders on a transparent canvas: paint a white background so
    // the exported image is readable outside the app.
    const source = chart.canvas;
    const target = document.createElement('canvas');
    target.width = source.width;
    target.height = source.height;

    const ctx = target.getContext('2d');
    let imageUri: string;
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, target.width, target.height);
      ctx.drawImage(source, 0, 0);
      imageUri = target.toDataURL('image/png', 1);
    } else {
      imageUri = chart.toBase64Image('image/png', 1);
    }

    this.download(imageUri, `${this.fileName()}.png`);
  }

  // ── Excel ─────────────────────────────────────────────────────────────────

  exportToExcel(): void {
    const chart = this.chartDirective?.chart;
    if (!chart?.data) {
      console.error('No hay datos disponibles en el gráfico para exportar');
      return;
    }

    const labels = (chart.data.labels as string[]) ?? [];
    const datasets = chart.data.datasets ?? [];

    const rows = labels.map((label, index) => {
      const row: Record<string, any> = { 'Categoría / Etiqueta': label };
      datasets.forEach((dataset) => {
        const name = dataset.label || 'Serie sin nombre';
        row[name] = dataset.data[index];
      });
      return row;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, this.excelSheetName());
    XLSX.writeFile(workbook, `${this.fileName()}.xlsx`);
  }

  private download(href: string, name: string): void {
    const link = document.createElement('a');
    link.download = name;
    link.href = href;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

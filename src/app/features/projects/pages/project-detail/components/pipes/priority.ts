import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "priorityLabel",
  standalone: true,
})
export class PriorityLabelPipe implements PipeTransform {
  private readonly priorityMap: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    extreme: "Extrema",
  };

  transform(value: string | undefined | null): string {
    if (!value) return "—";

    const key = value.toLowerCase();
    return this.priorityMap[key] ?? value;
  }
}

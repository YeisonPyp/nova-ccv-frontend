import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "nestedValue",
  standalone: true,
})
export class NestedValuePipe implements PipeTransform {
  transform(obj: any, path: string | number | symbol): any {
    if (!obj) return "-";

    if (typeof path !== "string") {
      return obj[path] !== undefined && obj[path] !== null ? obj[path] : "-";
    }

    const result = path.split(".").reduce((acc, part) => {
      return acc && acc[part] !== undefined && acc[part] !== null
        ? acc[part]
        : undefined;
    }, obj);

    return result !== undefined && result !== null && result !== ""
      ? result
      : "-";
  }
}

import { HttpParams } from "@angular/common/http";

export interface PageableQuery {
  page?: number;
  size?: number;
  sort?: string;
}

export class PageableQueryParams {
  constructor(private p: PageableQuery) {}
  getParams(): Record<string, any> {
    return Object.entries(this.p).reduce((params, [key, value]) => {
      if (value != undefined && value != null) {
        params[key] = value
      }
      return params;
    }, {} as Record<string, unknown>);
  }
}

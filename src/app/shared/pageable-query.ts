import { HttpParams } from "@angular/common/http";

export interface PageableQuery {
  page?: number;
  size?: number;
  sort?: string;
}

export class PageableQueryParams {
  constructor(private p: PageableQuery) {}
  getParams(): HttpParams {
    return Object.entries(this.p).reduce((params, [key, value]) => {
      if (value) {
        params.set(key, value.toString());
      }
      return params;
    }, new HttpParams());
  }
}

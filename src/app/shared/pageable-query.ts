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
      console.log(key, value)
      if (value != undefined && value != null) {
        params.set(key, value);
      }
      return params;
    }, new HttpParams());
  }
}

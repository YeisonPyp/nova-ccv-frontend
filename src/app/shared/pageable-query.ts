import { ExpressionNode } from '@rsql/ast';
import builder from '@rsql/builder';
import { emit } from '@rsql/emitter';

export interface PageableQuery {
  page?: number;
  size?: number;
  sort?: string;
  nodes?: ExpressionNode[];
}

export class PageableQueryParams {
  constructor(private p: PageableQuery) {}
  getParams(): Record<string, any> {
    const { nodes, ...paramObject } = this.p;
    const result = Object.entries(paramObject).reduce(
      (params, [key, value]) => {
        if (value != undefined && value != null) {
          params[key] = value;
        }
        return params;
      },
      {} as Record<string, unknown>,
    );

    if (nodes?.length) {
      result['rsqlQuery'] = emit(builder.and(...nodes));
    }
    return result;
  }
}

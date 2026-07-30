import type { ExpressionNode } from "@rsql/ast";
import builder from "@rsql/builder";
import { FilterOperator } from "../components/dynamic-table/dynamic-table.component";

export function coerceFilterValue(
  value: string,
  valueType?: string,
): string | number | boolean {
  if (valueType === "number") return Number(value);
  if (valueType === "checkbox") return value === "true";
  return value;
}

export function buildRsqlPredicate(
  field: string,
  operator: FilterOperator,
  value: string | number | boolean,
): ExpressionNode {
  switch (operator) {
    case "eq":
      return builder.eq(field, String(value));
    case "ne":
      return builder.neq(field, String(value));
    case "lt":
      return builder.lt(field, String(value));
    case "lte":
      return builder.le(field, String(value));
    case "gt":
      return builder.gt(field, String(value));
    case "gte":
      return builder.ge(field, String(value));
    case "lk":
      return builder.eq(field, `*${value}*`);
  }
}

import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatProduct } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";

export interface CreatePatProductDto {
  name: string;
  code?: string;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class ProductService extends FilterServiceSpecImpl<
  PatProduct,
  CreatePatProductDto
> {
  constructor() {
    super("pat/v2/products");
  }
}

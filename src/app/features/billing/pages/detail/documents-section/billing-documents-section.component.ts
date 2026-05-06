import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BillingAccountDocument } from "../../../../../core/models/billing/billing-account.model";
import {
  FileItemComponent,
  FileResource,
} from "../../../../../shared/components/file-item/file-item.component";

@Component({
  selector: "app-billing-documents-section",
  standalone: true,
  imports: [CommonModule, FileItemComponent],
  templateUrl: "./billing-documents-section.component.html",
})
export class BillingDocumentsSectionComponent {
  documents = input.required<BillingAccountDocument[]>();

  toFileResource(doc: BillingAccountDocument): FileResource {
    return {
      id: doc.id,
      bucketName: doc.bucketName,
      fileName: doc.objectName,
    };
  }
}

import { CommonModule } from "@angular/common";
import { Component, inject, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Survey } from "@/app/core/models/assessment/survey.model";
import { SurveyService } from "@/app/core/services/assessment/survey.service";
import { EditIconComponent } from "@/app/shared/components/edit-icon/edit-icon.component";
import { TrashIconComponent } from "@/app/shared/components/edit-icon/trash-icon.component";
import { HasPermissionDirective } from "@/app/shared/directives/has-permission.directive";
import { PaginationTableComponent } from "@/app/shared/components/pagination-table/pagination-table.component";
import { TableColumn } from "@/app/shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-surveys-list",
  standalone: true,
  imports: [
    CommonModule,
    EditIconComponent,
    TrashIconComponent,
    PaginationTableComponent,
    HasPermissionDirective,
  ],
  templateUrl: "./surveys-list.component.html",
})
export class SurveysListComponent {
  service = inject(SurveyService);
  private readonly router = inject(Router);

  @ViewChild(PaginationTableComponent) table?: PaginationTableComponent<Survey>;

  columns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
    {
      key: "questions",
      label: "Preguntas",
      valueCallBack: (item: Survey) => item.questions?.length || 0,
    },
  ];

  goToCreate() {
    this.router.navigate(["/assessment/surveys/new"]);
  }

  goToEdit(survey: Survey) {
    this.router.navigate(["/assessment/surveys", survey.id]);
  }

  openDelete(survey: Survey) {
    if (confirm(`¿Desea elminar la encuesta "${survey.name}"?`)) {
      this.service.delete(survey.id).subscribe(() => {
        const table = this.table;
        if (table) table.load(table.currentPage());
      });
    }
  }
}

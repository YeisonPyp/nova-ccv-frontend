import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { CreateGoalFromTemplate, Goal } from "../../models/goals/goal.model";
import { GoalTemplate } from "../../models/goals/goal-template.model";
import { GoalOption } from "../../models/goals/goal-option.model";

@Injectable({
  providedIn: "root",
})
export class GoalService {
  private http = inject(HttpClient);

  private readonly goalsApiUrl = `${environment.apiUrl}/goals`;
  private readonly goalTemplatesApiUrl = `${environment.apiUrl}/goal-templates`;
  private readonly goalTemplateVarsApiUrl = `${environment.apiUrl}/goal-template-vars`;

  /**
   * Retrieves a paginated list of goals.
   */
  findGoals(
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<APIPage<Goal>>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http.get<ApiResponse<APIPage<Goal>>>(this.goalsApiUrl, {
      params,
    });
  }

  /**
   * Retrieves all goal templates.
   */
  getGoalTemplatesFromGoals(): Observable<ApiResponse<GoalTemplate[]>> {
    return this.http.get<ApiResponse<GoalTemplate[]>>(
      `${this.goalsApiUrl}/templates`,
    );
  }

  /**
   * Retrieves all goal templates.
   */
  findAllGoalTemplates(): Observable<ApiResponse<GoalTemplate[]>> {
    return this.http.get<ApiResponse<GoalTemplate[]>>(this.goalTemplatesApiUrl);
  }

  /**
   * Retrieves paginated options for a specific template variable.
   */
  findOptionsForTemplateVar(
    id: number,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<APIPage<GoalOption>>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http.get<ApiResponse<APIPage<GoalOption>>>(
      `${this.goalTemplateVarsApiUrl}/${id}`,
      { params },
    );
  }

  /**
   * Creates a goal from a template.
   */
  createGoalFromTemplate(
    d: CreateGoalFromTemplate,
  ): Observable<ApiResponse<Goal>> {
    return this.http.post<ApiResponse<Goal>>(this.goalsApiUrl, d);
  }
}

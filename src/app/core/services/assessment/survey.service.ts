import { Injectable } from "@angular/core";
import { map } from "rxjs";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { Survey, SurveyQuestion } from "../../models/assessment/survey.model";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";

export interface CreateSurveyDto {
  name: string;
  description?: string;
}

export interface CreateSurveyQuestionDto {
  surveyId: number;
  description: string;
  minValue?: number;
  maxValue: number;
  displayOrder: number;
}

@Injectable({ providedIn: "root" })
export class SurveyService extends FilterServiceSpecImpl<
  Survey,
  CreateSurveyDto
> {
  constructor() {
    super("surveys");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<Survey>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<Survey>,
  ) {
    return new SearchSelectContextFactory<Survey>(
      (term) =>
        this.findAll({ rsqlQuery: emit(builder.eq("name", `*${term}*`)) }).pipe(
          map((res) => res?.data?.content ?? []),
        ),
      (s) => ({ id: s.id, title: s.name }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}

@Injectable({ providedIn: "root" })
export class SurveyQuestionService extends FilterServiceSpecImpl<
  SurveyQuestion,
  CreateSurveyQuestionDto
> {
  constructor() {
    super("survey-questions");
  }
}

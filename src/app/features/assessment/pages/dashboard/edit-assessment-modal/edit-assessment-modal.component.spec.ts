import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditAssessmentModalComponent } from "./edit-assessment-modal.component";
import { Assessment } from "../../../../../core/models/assessment/assessment.model";

describe("EditAssessmentModalComponent", () => {
  let component: EditAssessmentModalComponent;
  let fixture: ComponentFixture<EditAssessmentModalComponent>;
  let assesment: Assessment = {
    id: 1,
    finalScoreCompetencies: 0,
    finalScoreResults: 0,
    matrixTotalScore: 0,
    status: "",
    strengths: "",
    aspectsToImprove: "",
    observations: "",
    agreements: "",
    createdAt: "",
    score: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAssessmentModalComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAssessmentModalComponent);
    fixture.componentRef.setInput("assessment", assesment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

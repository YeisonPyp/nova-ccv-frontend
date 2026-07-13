import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditAssessmentModalComponent } from "./edit-assessment-modal.component";
import { Assessment } from "@/app/core/models/assessment/assessment.model";

describe("EditAssessmentModalComponent", () => {
  let component: EditAssessmentModalComponent;
  let fixture: ComponentFixture<EditAssessmentModalComponent>;
  let assesment: Assessment = {
    id: 1,
    finalScoreCompetencies: 0,
    area: {
      id: 1,
      name: "Example Area",
    },
    competencyScores: [
      {
        id: 1,
        impactFactor: 0,
        score: 0,
        weightedScore: 0,
        competency: {
          id: 1,
          name: "Example Competency",
          description: "Example Competency Description",
        },
      },
      {
        id: 2,
        impactFactor: 0,
        score: 0,
        weightedScore: 0,
        competency: {
          id: 1,
          name: "Example Competency",
          description: "Example Competency Description",
        },
      },
    ],
    evaluatee: {
      id: 1,
      name: "Juan",
      lastName: "Perez",
      email: "",
      positionId: 0,
      isActive: false,
    },
    evaluator: {
      id: 2,
      name: "Pablo",
      lastName: "Gomez",
      email: "",
      positionId: 0,
      isActive: false,
    },
    period: {
      createdAt: "",
      endDate: "",
      startDate: "",
      updatedAt: "",
      id: 1,
      name: "Example Period",
      averageScore: 0,
    },
    position: {
      id: 1,
      name: "Example Position",
      areaId: 1,
      areaName: "Example Area",
      description: "Example Position Description",
    },
    matrixTotalScore: 0,
    status: "PENDING",
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

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PeriodCardComponent } from "./card.component";
import { Period } from "../../../../../core/models/assessment/period.model";

describe("PeriodCardComponent", () => {
  let component: PeriodCardComponent;
  let fixture: ComponentFixture<PeriodCardComponent>;
  let period: Period = {
    id: 0,
    name: "",
    startDate: "",
    endDate: "",
    weightCompetencies: 0,
    weightResults: 0,
    createdAt: "",
    updatedAt: "",
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PeriodCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("period", period);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

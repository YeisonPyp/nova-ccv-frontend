import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AssessmentDashboardComponent } from "./assessment-dashboard.component";
import { provideHttpClient } from "@angular/common/http";

describe("AssessmentDashboardComponent", () => {
  let component: AssessmentDashboardComponent;
  let fixture: ComponentFixture<AssessmentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentDashboardComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PeriodCardComponent } from "./card.component";

describe("PeriodCardComponent", () => {
  let component: PeriodCardComponent;
  let fixture: ComponentFixture<PeriodCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PeriodCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

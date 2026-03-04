import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CurrentPeriodsCarouselComponent } from "./current-periods-carousel.component";
import { provideHttpClient } from "@angular/common/http";

describe("CurrentPeriodsCarouselComponent", () => {
  let component: CurrentPeriodsCarouselComponent;
  let fixture: ComponentFixture<CurrentPeriodsCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentPeriodsCarouselComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentPeriodsCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

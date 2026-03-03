import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentPeriodsCarouselComponent } from './current-periods-carousel.component';

describe('CurrentPeriodsCarouselComponent', () => {
  let component: CurrentPeriodsCarouselComponent;
  let fixture: ComponentFixture<CurrentPeriodsCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentPeriodsCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentPeriodsCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

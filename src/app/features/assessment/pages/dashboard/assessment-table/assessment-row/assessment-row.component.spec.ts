import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentRowComponent } from './assessment-row.component';

describe('AssessmentRowComponent', () => {
  let component: AssessmentRowComponent;
  let fixture: ComponentFixture<AssessmentRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

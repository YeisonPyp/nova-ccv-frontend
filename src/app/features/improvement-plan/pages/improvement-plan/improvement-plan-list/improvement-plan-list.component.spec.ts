import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprovementPlanListComponent } from './improvement-plan-list.component';

describe('ImprovementPlanListComponent', () => {
  let component: ImprovementPlanListComponent;
  let fixture: ComponentFixture<ImprovementPlanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImprovementPlanListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImprovementPlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalsDashboardComponent } from './goals-dashboard.component';

describe('GoalsDashboardComponent', () => {
  let component: GoalsDashboardComponent;
  let fixture: ComponentFixture<GoalsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

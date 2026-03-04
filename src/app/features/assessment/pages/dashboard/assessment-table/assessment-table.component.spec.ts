import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AssessmentTableComponent } from './assessment-table.component';

describe('AssessmentTableComponent', () => {
  let component: AssessmentTableComponent;
  let fixture: ComponentFixture<AssessmentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentTableComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentTableComponent);
    fixture.componentRef.setInput('assessments', []);
    fixture.componentRef.setInput('size', 10);
    fixture.componentRef.setInput('page', 1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

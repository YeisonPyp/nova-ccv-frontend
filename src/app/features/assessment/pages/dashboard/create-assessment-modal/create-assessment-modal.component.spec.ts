import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CreateAssessmentModalComponent } from './create-assessment-modal.component';

describe('CreateAssessmentModalComponent', () => {
  let component: CreateAssessmentModalComponent;
  let fixture: ComponentFixture<CreateAssessmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAssessmentModalComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAssessmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

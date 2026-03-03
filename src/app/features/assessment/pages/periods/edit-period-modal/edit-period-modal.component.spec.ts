import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPeriodModalComponent } from './edit-period-modal.component';

describe('EditPeriodModalComponent', () => {
  let component: EditPeriodModalComponent;
  let fixture: ComponentFixture<EditPeriodModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPeriodModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPeriodModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

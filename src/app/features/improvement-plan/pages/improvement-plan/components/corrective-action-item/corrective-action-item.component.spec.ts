import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectiveActionItemComponent } from './corrective-action-item.component';

describe('CorrectiveActionItemComponent', () => {
  let component: CorrectiveActionItemComponent;
  let fixture: ComponentFixture<CorrectiveActionItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorrectiveActionItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrectiveActionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlEntityModalComponent } from './control-entity-modal.component';

describe('ControlEntityModalComponent', () => {
  let component: ControlEntityModalComponent;
  let fixture: ComponentFixture<ControlEntityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlEntityModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlEntityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

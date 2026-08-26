import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlEntityListComponent } from './control-entity-list.component';

describe('ControlEntityListComponent', () => {
  let component: ControlEntityListComponent;
  let fixture: ComponentFixture<ControlEntityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlEntityListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlEntityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

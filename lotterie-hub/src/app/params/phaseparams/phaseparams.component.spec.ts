import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhaseparamsComponent } from './phaseparams.component';

describe('PhaseparamsComponent', () => {
  let component: PhaseparamsComponent;
  let fixture: ComponentFixture<PhaseparamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhaseparamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseparamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

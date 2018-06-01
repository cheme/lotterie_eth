import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhaseparamDetailComponent } from './phaseparam-detail.component';

describe('PhaseparamDetailComponent', () => {
  let component: PhaseparamDetailComponent;
  let fixture: ComponentFixture<PhaseparamDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhaseparamDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseparamDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

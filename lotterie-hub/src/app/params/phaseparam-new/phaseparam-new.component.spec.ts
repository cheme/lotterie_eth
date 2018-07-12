import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhaseparamNewComponent } from './phaseparam-new.component';

describe('PhaseparamNewComponent', () => {
  let component: PhaseparamNewComponent;
  let fixture: ComponentFixture<PhaseparamNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhaseparamNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseparamNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

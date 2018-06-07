import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThrowDetailsSmallComponent } from './throw-details-small.component';

describe('ThrowDetailsSmallComponent', () => {
  let component: ThrowDetailsSmallComponent;
  let fixture: ComponentFixture<ThrowDetailsSmallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThrowDetailsSmallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThrowDetailsSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

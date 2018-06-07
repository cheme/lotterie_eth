import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThrowDetailsComponent } from './throw-details.component';

describe('ThrowDetailsComponent', () => {
  let component: ThrowDetailsComponent;
  let fixture: ComponentFixture<ThrowDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThrowDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThrowDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

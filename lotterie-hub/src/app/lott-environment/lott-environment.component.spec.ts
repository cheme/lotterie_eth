import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LottEnvironmentComponent } from './lott-environment.component';

describe('LottEnvironmentComponent', () => {
  let component: LottEnvironmentComponent;
  let fixture: ComponentFixture<LottEnvironmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LottEnvironmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LottEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

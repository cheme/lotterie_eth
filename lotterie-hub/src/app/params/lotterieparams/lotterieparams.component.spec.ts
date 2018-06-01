import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotterieparamsComponent } from './lotterieparams.component';

describe('LotterieparamsComponent', () => {
  let component: LotterieparamsComponent;
  let fixture: ComponentFixture<LotterieparamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotterieparamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotterieparamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

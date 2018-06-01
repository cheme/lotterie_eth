import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotterieparamDetailComponent } from './lotterieparam-detail.component';

describe('LotterieparamDetailComponent', () => {
  let component: LotterieparamDetailComponent;
  let fixture: ComponentFixture<LotterieparamDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotterieparamDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotterieparamDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

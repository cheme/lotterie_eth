import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotterieparamNewComponent } from './lotterieparam-new.component';

describe('LotterieparamNewComponent', () => {
  let component: LotterieparamNewComponent;
  let fixture: ComponentFixture<LotterieparamNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotterieparamNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotterieparamNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningparamsComponent } from './winningparams.component';

describe('WinningparamsComponent', () => {
  let component: WinningparamsComponent;
  let fixture: ComponentFixture<WinningparamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinningparamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinningparamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

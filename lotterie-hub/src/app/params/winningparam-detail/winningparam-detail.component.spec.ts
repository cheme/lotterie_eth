import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningparamDetailComponent } from './winningparam-detail.component';

describe('WinningparamDetailComponent', () => {
  let component: WinningparamDetailComponent;
  let fixture: ComponentFixture<WinningparamDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinningparamDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinningparamDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

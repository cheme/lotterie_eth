import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountEthComponent } from './amount-eth.component';

describe('AmountEthComponent', () => {
  let component: AmountEthComponent;
  let fixture: ComponentFixture<AmountEthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmountEthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmountEthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

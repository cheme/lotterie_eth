import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErcValueComponent } from './erc-value.component';

describe('ErcValueComponent', () => {
  let component: ErcValueComponent;
  let fixture: ComponentFixture<ErcValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErcValueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErcValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestnbComponent } from './testnb.component';

describe('TestnbComponent', () => {
  let component: TestnbComponent;
  let fixture: ComponentFixture<TestnbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestnbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestnbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThrowDetailComponent } from './throw-detail.component';

describe('ThrowDetailComponent', () => {
  let component: ThrowDetailComponent;
  let fixture: ComponentFixture<ThrowDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThrowDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThrowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

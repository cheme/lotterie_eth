import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThrowsComponent } from './throws.component';

describe('ThrowsComponent', () => {
  let component: ThrowsComponent;
  let fixture: ComponentFixture<ThrowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThrowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThrowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

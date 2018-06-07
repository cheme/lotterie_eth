import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThrowNewComponent } from './throw-new.component';

describe('ThrowNewComponent', () => {
  let component: ThrowNewComponent;
  let fixture: ComponentFixture<ThrowNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThrowNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThrowNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

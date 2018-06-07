import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipationNewComponent } from './participation-new.component';

describe('ParticipationNewComponent', () => {
  let component: ParticipationNewComponent;
  let fixture: ComponentFixture<ParticipationNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipationNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipationNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

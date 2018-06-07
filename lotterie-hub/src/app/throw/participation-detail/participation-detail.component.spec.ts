import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipationDetailComponent } from './participation-detail.component';

describe('ParticipationDetailComponent', () => {
  let component: ParticipationDetailComponent;
  let fixture: ComponentFixture<ParticipationDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipationDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

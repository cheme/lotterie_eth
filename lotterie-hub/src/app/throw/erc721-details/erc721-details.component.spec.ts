import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Erc721DetailsComponent } from './erc721-details.component';

describe('Erc721DetailsComponent', () => {
  let component: Erc721DetailsComponent;
  let fixture: ComponentFixture<Erc721DetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Erc721DetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Erc721DetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

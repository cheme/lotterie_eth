import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddErc721Component } from './add-erc721.component';

describe('AddErc721Component', () => {
  let component: AddErc721Component;
  let fixture: ComponentFixture<AddErc721Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddErc721Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddErc721Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

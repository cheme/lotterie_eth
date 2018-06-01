import { TestBed, inject } from '@angular/core/testing';

import { LotterieService } from './lotterie.service';

describe('LotterieService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LotterieService]
    });
  });

  it('should be created', inject([LotterieService], (service: LotterieService) => {
    expect(service).toBeTruthy();
  }));
});

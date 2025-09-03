import { TestBed } from '@angular/core/testing';

import { CompteComptableService } from './compte-comptable.service';

describe('CompteComptableService', () => {
  let service: CompteComptableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompteComptableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

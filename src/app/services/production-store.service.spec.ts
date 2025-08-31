import { TestBed } from '@angular/core/testing';

import { ProductionStoreService } from './production-store.service';

describe('ProductionStoreService', () => {
  let service: ProductionStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

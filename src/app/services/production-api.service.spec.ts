import { TestBed } from '@angular/core/testing';

import { ProductionApiService } from './production-api.service';

describe('ProductionApiService', () => {
  let service: ProductionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

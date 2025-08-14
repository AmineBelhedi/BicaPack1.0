import { TestBed } from '@angular/core/testing';

import { FilterRoleService } from './filter-role.service';

describe('FilterRoleService', () => {
  let service: FilterRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { OptimisationService } from './optimisation.service';

describe('OptimisationService', () => {
  let service: OptimisationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OptimisationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

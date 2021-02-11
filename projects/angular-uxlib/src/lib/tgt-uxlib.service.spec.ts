import { TestBed } from '@angular/core/testing';

import { TgtUxlibService } from './tgt-uxlib.service';

describe('TgtUxlibService', () => {
  let service: TgtUxlibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TgtUxlibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

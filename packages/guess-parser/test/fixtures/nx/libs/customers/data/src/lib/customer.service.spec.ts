import { TestBed } from '@angular/core/testing';

import { CustomerService } from './customer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CustomerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
  );

  it('should be created', () => {
    const service: CustomerService = TestBed.get(CustomerService);
    expect(service).toBeTruthy();
  });
});

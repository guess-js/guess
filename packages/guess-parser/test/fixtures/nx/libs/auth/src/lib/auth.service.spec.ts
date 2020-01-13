import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    })
  );

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });
});

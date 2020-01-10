import { async, TestBed } from '@angular/core/testing';
import { HomeUiModule } from './feat-home.module';

describe('HomeUiModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HomeUiModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(HomeUiModule).toBeDefined();
  });
});

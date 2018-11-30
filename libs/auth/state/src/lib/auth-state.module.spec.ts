import { async, TestBed } from '@angular/core/testing';
import { AuthStateModule } from './auth-state.module';

describe('AuthStateModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AuthStateModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(AuthStateModule).toBeDefined();
  });
});

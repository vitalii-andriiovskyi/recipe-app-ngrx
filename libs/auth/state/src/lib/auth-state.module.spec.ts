import { async, TestBed } from '@angular/core/testing';
import { AuthStateModule } from './auth-state.module';

describe('AuthStateModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AuthStateModule]
    }).compileComponents();
  }));

  it('should create', () => {
    // it gives the error because of tests of AuthEffects and AuthReducer; They have circular dependencies with @recipe-app-ngrx/auth/login-ui
    expect(AuthStateModule).toBeDefined();
  });
});

import { async, TestBed } from '@angular/core/testing';
import { AuthLoginUiModule } from './auth-login-ui.module';

describe('AuthLoginUiModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AuthLoginUiModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(AuthLoginUiModule).toBeDefined();
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { LogService, SessionStorageService, ENV_RCP } from '@recipe-app-ngrx/utils';
const env: any = {
  production: false
}

describe('AuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientTestingModule ],
    providers: [
      LogService,
      SessionStorageService,
      AuthService,
      { provide: ENV_RCP, useValue: env },
    ]
  }));

  it('should be created', () => {
    const service: AuthService = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });
});

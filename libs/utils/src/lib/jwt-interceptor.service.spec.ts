import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { JwtInterceptorProvider } from './jwt-interceptor.service';
import { LocalStorageService } from './local-storage.service';

describe('JwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const URI = '/api/auth';
  let localStorageService: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ 
        JwtInterceptorProvider,
        LocalStorageService      
      ]
    });

    http = TestBed.get(HttpClient);
    httpMock = TestBed.get(HttpTestingController);
    localStorageService = TestBed.get(LocalStorageService);
  });
  
  it('should add an Authorization header if ', () => {
    localStorageService.setItem('currentUser', {token: 'token'});
    const user = localStorageService.getItem('currentUser');
    expect(user.token).toBe('token');

    http.get<any>(URI).subscribe(response => {
      expect(response).toBeTruthy('response has came');
    });

    const req = httpMock.expectOne(URI);

    expect(req.request.headers.has('Authorization')).toBeTruthy('request has Authorization token');

    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer token`,
    );
  });
});

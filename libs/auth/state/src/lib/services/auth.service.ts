import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthUserVW, User, SessionData } from '@recipe-app-ngrx/models';
import { SessionStorageService, LogService } from '@recipe-app-ngrx/utils';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_PATH = `api/users/authenticate`;
  private API_PATH_LOGOUT = `api/users/logout`;

  constructor(private http: HttpClient,
              private sessionStorageService: SessionStorageService,
              private logger: LogService) { }

  login({ username, password }: AuthUserVW): Observable<SessionData> {
    return this.http.post<SessionData>(this.API_PATH, { username: username, password: password });
  }

  logout() {
    return this.http.delete(this.API_PATH_LOGOUT).pipe(
      tap(() => this.sessionStorageService.removeItem('currentUser')),
      catchError((err) => {
        this.logger.error(err)
        return of(true);
      })
    )
  }
}

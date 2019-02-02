import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthUserVW, User } from '@recipe-app-ngrx/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_PATH = `api/users/authenticate`;

  constructor(private http: HttpClient) { }

  login({ username, password }: AuthUserVW): Observable<User> {
    return this.http.post<User>(this.API_PATH, { username: username, password: password });
  }

  logout() {
    localStorage.removeItem('currentUser');
    return of(true);
  }
}

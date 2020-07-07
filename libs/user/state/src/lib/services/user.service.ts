import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '@recipe-app-ngrx/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_PATH = `api/users`;

  constructor(private http: HttpClient) { }

  loadUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_PATH}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthFacade } from '../+state/auth.facade';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authFacade: AuthFacade) { }

  canActivate(): Observable<boolean> {
    return this.authFacade.loggedIn$.pipe(
      map(loggedIn => {
        if (!loggedIn) {
          this.authFacade.loginRedirect();
          return false;
        }

        return true;
      }),
      take(1)
    );
  }
}

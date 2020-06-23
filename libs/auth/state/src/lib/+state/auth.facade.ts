import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { AuthPartialState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import { Login, Logout, LoginRedirect } from './auth.actions';
import { AuthUserVW } from '@recipe-app-ngrx/models';

@Injectable()
export class AuthFacade {
  authencticatedUser$ = this.store.pipe(select(authQuery.getUser));
  loggedIn$ = this.store.pipe(select(authQuery.getLoggedIn));
  error$ = this.store.pipe(select(authQuery.getAuthError));
  pending$ = this.store.pipe(select(authQuery.getAuthPending));
  session$ = this.store.pipe(select(authQuery.getSession));

  constructor(private store: Store<AuthPartialState>) {}

  /**
   * This method should be called on `Login Page`
   */
  login(user: AuthUserVW) {
    this.store.dispatch(new Login({authUser: user}));
  }

  /**
   * This method should be called on `User Page`
   */
  logout() {
    this.store.dispatch(new Logout());
  }

  loginRedirect() {
    this.store.dispatch(new LoginRedirect());
  }
}

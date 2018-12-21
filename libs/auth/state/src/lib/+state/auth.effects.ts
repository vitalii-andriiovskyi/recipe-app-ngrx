import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/nx';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

import { AuthPartialState } from './auth.reducer';
import {
  Login,
  LoginSuccess,
  LoginFailure,
  LoginRedirect,
  Logout,
  LogoutConfirmation,
  LogoutDismiss,
  AuthActionTypes
} from './auth.actions';
import { AuthUserVW } from '@recipe-app-ngrx/models';
import { AuthService, LocalStorageService } from '@recipe-app-ngrx/utils';
import { LogoutConfirmationDialogComponent } from '@recipe-app-ngrx/auth/login-ui';

@Injectable()
export class AuthEffects {

  @Effect()
  login$ = this.actions$.pipe(
    ofType<Login>(AuthActionTypes.Login),
    map(action => action.payload.authUser),
    exhaustMap((auth: AuthUserVW) =>
      this.authService.login(auth).pipe(
        tap(user => {
          if (user && user.token) {
            this.localeStorageService.setItem('currentUser', JSON.stringify(user));
          }
        }),
        map(user => new LoginSuccess({ user })),
        catchError(error => of(new LoginFailure({ error: error.error })))
      )
    )
  );

  // @Effect({ dispatch: false })
  // loginSuccess$ = this.actions$.pipe(
  //   ofType(AuthActionTypes.LoginSuccess),
  //   -- maybe should load additional data for authenitcated users
  //   tap(() => this.router.navigate(['/']))
  // );

  @Effect()
  logout$ = this.actions$.pipe(
    ofType(AuthActionTypes.Logout),
    exhaustMap(() => {
      const dialogRef = this.dialog.open<
        LogoutConfirmationDialogComponent,
        undefined,
        boolean
      >(LogoutConfirmationDialogComponent);

      return dialogRef.afterClosed();
    }),
    map(
      result =>
        result
          ? new LogoutConfirmation()
          : new LogoutDismiss()
    )
  );
  
  constructor(
    private actions$: Actions,
    private dataPersistence: DataPersistence<AuthPartialState>,
    private authService: AuthService,
    private localeStorageService: LocalStorageService,
    private dialog: MatDialog
  ) {}
}

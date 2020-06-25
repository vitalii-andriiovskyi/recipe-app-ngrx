import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/angular';
import { of } from 'rxjs';
import {
  map,
  exhaustMap,
  catchError,
  tap,
  withLatestFrom,
  delay
} from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

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
import { SessionStorageService } from '@recipe-app-ngrx/utils';
import { UserFacade } from '@recipe-app-ngrx/user/state';
import { AuthService } from '../services/auth.service';
import { LogoutConfirmationDialogComponent } from '@recipe-app-ngrx/auth/login-ui';
import { Router } from '@angular/router';
import { RouterHistoryFacade } from '@recipe-app-ngrx/router-history-state';
import { AuthFacade } from './auth.facade';

@Injectable()
export class AuthEffects {
  @Effect()
  login$ = this.actions$.pipe(
    ofType<Login>(AuthActionTypes.Login),
    map(action => action.payload.authUser),
    exhaustMap((auth: AuthUserVW) =>
      this.authService.login(auth).pipe(
        tap(session => {
          if (session && session.token) {
            this.sessionStorageService.setItem(
              'currentUser',
              session
            );
          }
        }),
        map(session => new LoginSuccess({ session })),
        catchError(error => of(new LoginFailure({ error: error.error })))
      )
    )
  );

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
    map(result => (result ? new LogoutConfirmation() : new LogoutDismiss()))
  );

  @Effect({ dispatch: false })
  logoutConfirmation$ = this.actions$.pipe(
    ofType(AuthActionTypes.LogoutConfirmation),
    withLatestFrom(this.routerHistoryFacade.currentRouter$),
    tap(([action, route]) => {
      // It's needed to reload current url in order to run 'AuthGuard' for certain components, which shouldn't be shown to unauthorized user
      // Remember to set `onSameUrlNavigation: 'reload'` if RouterModuld.forRoot() and `runGuardsAndResolvers: 'always'` in RecipeUiModule
      this.router.navigate([route.url.split('?')[0]], {
        queryParams: route.queryParams
      });
    })
  );

  @Effect({ dispatch: false })
  loginSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.LoginSuccess),
    // -- maybe should load additional data for authenticated users
    tap(() => this.userFacadeService.loadUser()),
    withLatestFrom(this.routerHistoryFacade.previousRouter$),
    tap(([action, route]) => {
      this.router.navigate([route.url.split('?')[0]], {
        queryParams: route.queryParams
      });
    })
  );

  @Effect({ dispatch: false })
  loginRedirect$ = this.actions$.pipe(
    ofType(AuthActionTypes.LoginRedirect),
    tap(() => this.router.navigate(['/login']))
  );

  constructor(
    private actions$: Actions,
    private dataPersistence: DataPersistence<AuthPartialState>,
    private authService: AuthService,
    private sessionStorageService: SessionStorageService,
    private dialog: MatDialog,
    private router: Router,
    private routerHistoryFacade: RouterHistoryFacade,
    private userFacadeService: UserFacade
  ) {}
}

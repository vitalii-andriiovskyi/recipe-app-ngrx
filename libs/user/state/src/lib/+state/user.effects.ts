import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, tap, withLatestFrom } from 'rxjs/operators';

import * as fromUser from './user.reducer';
import * as UserActions from './user.actions';
import { UserService } from '../services';
import { SessionStorageService } from '@recipe-app-ngrx/utils';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { of } from 'rxjs';
import { SessionData } from '@recipe-app-ngrx/models';

@Injectable()
export class UserEffects {
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUser),
      switchMap(() => {
        const id: string | undefined = this.sessionStorageService.getItem('currentUser')?.userId;
        return id ? this.userService.loadUser(id).pipe(
            map(user => UserActions.loadUserSuccess({ user })),
            catchError(error => of(UserActions.loadUserFailure({ error })))
          ) 
          : of(UserActions.loadUserFailure({error: `Cannot get user's id`}))
      })
    )
  );

  loadUserSuccess$ = createEffect(() => 
    this.actions$.pipe(
      ofType(UserActions.loadUserSuccess),
      withLatestFrom(this.authFacadeService.loggedIn$),
      tap(([action, loggedIn]) => {
        const session: SessionData = this.sessionStorageService.getItem('currentUser');
        if (session && !loggedIn) {
          this.authFacadeService.loginSuccess(session);
        }
      })
    ), { dispatch: false })

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private sessionStorageService: SessionStorageService,
    private authFacadeService: AuthFacade
  ) {}
}

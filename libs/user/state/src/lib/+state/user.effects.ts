import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';

import * as fromUser from './user.reducer';
import * as UserActions from './user.actions';
import { UserService } from '../services';
import { SessionStorageService } from '@recipe-app-ngrx/utils';
import { of } from 'rxjs';

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

  constructor(
    private actions$: Actions,
    private userService: UserService,
    private sessionStorageService: SessionStorageService
  ) {}
}

import { Injectable } from '@angular/core';

import { select, Store, Action } from '@ngrx/store';

import * as fromUser from './user.reducer';
import * as UserSelectors from './user.selectors';
import * as UserActions from './user.actions';

@Injectable()
export class UserFacade {
  getUser$ = this.store.pipe(select(UserSelectors.getUser));
  loading$ = this.store.pipe(select(UserSelectors.getUserLoading));
  error$ = this.store.pipe(select(UserSelectors.getUserError));

  constructor(private store: Store<fromUser.UserPartialState>) {}

  dispatch(action: Action) {
    this.store.dispatch(action);
  }

  loadUser() {
    this.dispatch(UserActions.loadUser());
  }
}

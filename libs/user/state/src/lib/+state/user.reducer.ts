import { createReducer, on, Action } from '@ngrx/store';

import * as UserActions from './user.actions';
import { User } from '@recipe-app-ngrx/models';

export const USER_FEATURE_KEY = 'user';

export interface UserState {
  user: User| null; // which User record has been selected
  pending?: boolean; // has the User list been loaded
  error?: string | null; // last none error (if any)
}

export interface UserPartialState {
  readonly [USER_FEATURE_KEY]: UserState;
}


export const initialState: UserState = {
  // set initial required properties
  user: null, 
  pending: false,
  error: null
};

const userReducer = createReducer(
  initialState,
  on(UserActions.loadUser, (state) => ({
    ...state,
    pending: true,
    error: null,
  })),
  on(UserActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    pending: false
  })),
  on(UserActions.loadUserFailure, (state, { error }) => ({
    ...state,
    pending: false,
    user: null,
    error
  }))
);

export function reducer(state: UserState | undefined, action: Action) {
  return userReducer(state, action);
}

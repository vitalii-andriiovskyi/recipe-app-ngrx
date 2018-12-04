import { AuthAction, AuthActionTypes } from './auth.actions';
import { User } from '@recipe-app-ngrx/models';

export const AUTH_FEATURE_KEY = 'auth';

/**
 * Interface for the 'Auth' data used in
 *  - AuthState, and
 *  - authReducer
 *
 *  Note: replace if already defined in another module
 */

/* tslint:disable:no-empty-interface */
export interface AuthState {
  loggedIn: boolean;
  user: User | null;
  pending: boolean;
  error: string | null; // last none error (if any)
}

export interface AuthPartialState {
  readonly [AUTH_FEATURE_KEY]: AuthState;
}

export const initialState: AuthState = {
  loggedIn: false,
  user: null,
  error: null,
  pending: false
};

export function authReducer(
  state: AuthState = initialState,
  action: AuthAction
): AuthState {
  switch (action.type) {
    case AuthActionTypes.Login: {
      state = {
        ...state,
        error: null,
        pending: true,
      };
      break;
    }

    case AuthActionTypes.LoginSuccess: {
      state = {
        ...state,
        loggedIn: true,
        user: action.payload.user,
        error: null,
        pending: false,
      };
      break;
    }

    case AuthActionTypes.LoginFailure: {
      state = {
        ...state,
        error: action.payload.error,
        pending: false,
      };
      break;
    }

    case AuthActionTypes.LogoutConfirmation: {
      state = initialState;
      break;
    }
  }
  return state;
}

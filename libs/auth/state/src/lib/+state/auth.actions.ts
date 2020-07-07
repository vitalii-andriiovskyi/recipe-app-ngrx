import { Action } from '@ngrx/store';
import { User, AuthUserVW, SessionData } from '@recipe-app-ngrx/models';

export enum AuthActionTypes {
  Login = '[Login Page] Login',
  Logout = '[User Page] Logout',
  LogoutConfirmation = '[Auth API] Logout Confirmation',
  LogoutDismiss = '[Auth API] Logout Dismiss',
  LoginSuccess = '[Auth API] Login Success',
  LoginFailure = '[Auth API] Login Failure',
  LoginRedirect = '[Auth API] Login Redirect'
}

export class Login implements Action {
  readonly type = AuthActionTypes.Login;

  constructor(public payload: { authUser: AuthUserVW }) {}
}

export class LoginSuccess implements Action {
  readonly type = AuthActionTypes.LoginSuccess;

  constructor(public payload: { session: SessionData }) {}
}

export class LoginFailure implements Action {
  readonly type = AuthActionTypes.LoginFailure;

  constructor(public payload: { error: any} ) {}
}

export class LoginRedirect implements Action {
  readonly type = AuthActionTypes.LoginRedirect;
}

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;
}

export class LogoutConfirmation implements Action {
  readonly type = AuthActionTypes.LogoutConfirmation;
}

export class LogoutDismiss implements Action {
  readonly type = AuthActionTypes.LogoutDismiss;
}

export type AuthAction =
  | Login
  | LoginSuccess
  | LoginFailure
  | LoginRedirect
  | Logout
  | LogoutConfirmation
  | LogoutDismiss;

export const fromAuthActions = {
  Login,
  LoginSuccess,
  LoginFailure,
  LoginRedirect,
  Logout,
  LogoutConfirmation,
  LogoutDismiss
};

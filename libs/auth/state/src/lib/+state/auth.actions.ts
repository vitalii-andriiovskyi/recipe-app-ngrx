import { Action } from '@ngrx/store';
import { User, AuthenticateVW } from '../models/user';

export enum AuthActionTypes {
  Login = '[Login Page] Login',
  Logout = '[User Page] Logout',
  LoginSuccess = '[Auth API] Login Success',
  LoginFailure = '[Auth API] Login Failure',
  LoginRedirect = '[Auth API] Login Redirect'
}

export class Login implements Action {
  readonly type = AuthActionTypes.Login;

  constructor(public payload: AuthenticateVW) {}
}

export class LoginSuccess implements Action {
  readonly type = AuthActionTypes.LoginSuccess;

  constructor(public payload: { user: User }) {}
}

export class LoginFailure implements Action {
  readonly type = AuthActionTypes.LoginFailure;

  constructor(public payload: any) {}
}

export class LoginRedirect implements Action {
  readonly type = AuthActionTypes.LoginRedirect;
}

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;
}

export type AuthAction =
  | Login
  | LoginSuccess
  | LoginFailure
  | LoginRedirect
  | Logout;

export const fromAuthActions = {
  Login,
  LoginSuccess,
  LoginFailure,
  LoginRedirect,
  Logout
};

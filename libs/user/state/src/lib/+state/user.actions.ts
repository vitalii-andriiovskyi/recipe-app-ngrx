import { createAction, props } from '@ngrx/store';
import { User } from '@recipe-app-ngrx/models';

export const loadUser = createAction('[User/Auth Api] Load User');

export const loadUserSuccess = createAction(
  '[User/API] Load User Success',
  props<{ user: User }>()
);

export const loadUserFailure = createAction(
  '[User/API] Load User Failure',
  props<{ error: any }>()
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AUTH_FEATURE_KEY, AuthState } from './auth.reducer';

export const selectionMethods: any = {
  getLoggedIn: (state: AuthState) => state.loggedIn,
  getUser: (state: AuthState) => state.user,
  getError: (state: AuthState) => state.error,
  getPending: (state: AuthState) => state.pending,
  getSession: (state: AuthState) => state.session,
}

// Lookup the 'Auth' feature state managed by NgRx
const selectAuthState = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

export const getUser = createSelector(selectAuthState, selectionMethods.getUser);
export const getLoggedIn = createSelector(selectAuthState, selectionMethods.getLoggedIn);
export const getAuthError = createSelector(selectAuthState, selectionMethods.getError);
export const getAuthPending = createSelector(selectAuthState, selectionMethods.getPending);
export const getSession = createSelector(selectAuthState, selectionMethods.getSession);

export const authQuery = {
  getUser,
  getLoggedIn,
  getAuthError,
  getAuthPending,
  getSession
};

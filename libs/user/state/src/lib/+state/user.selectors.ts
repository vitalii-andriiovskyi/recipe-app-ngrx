import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  USER_FEATURE_KEY,
  UserState,
  UserPartialState,
} from './user.reducer';

// Lookup the 'User' feature state managed by NgRx
export const getUserState = createFeatureSelector<UserPartialState, UserState>(
  USER_FEATURE_KEY
);

export const getUserLoading = createSelector(
  getUserState,
  (state: UserState) => state.pending
);
export const getUser = createSelector(
  getUserState,
  (state: UserState) => state.user
);

export const getUserError = createSelector(
  getUserState,
  (state: UserState) => state.error
);

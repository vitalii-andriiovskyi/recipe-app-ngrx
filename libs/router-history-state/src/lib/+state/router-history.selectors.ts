import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  ROUTERHISTORY_FEATURE_KEY,
  RouterHistoryState
} from './router-history.reducer';

// Lookup the 'RouterHistory' feature state managed by NgRx
const getRouterHistoryState = createFeatureSelector<RouterHistoryState>(
  ROUTERHISTORY_FEATURE_KEY
);

const getPreviousRouter = createSelector(
  getRouterHistoryState,
  (state: RouterHistoryState) => state.previousRouter
);

const getCurrentRouter = createSelector(
  getRouterHistoryState,
  (state: RouterHistoryState) => state.currentRouter
);


export const routerHistoryQuery = {
  getPreviousRouter,
  getCurrentRouter
};

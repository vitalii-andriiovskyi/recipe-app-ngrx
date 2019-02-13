import {
  RouterHistoryAction,
  RouterHistoryActionTypes
} from './router-history.actions';
import { RouterStateUrl } from '@recipe-app-ngrx/utils';

export const ROUTERHISTORY_FEATURE_KEY = 'routerHistory';

/**
 * Interface for the 'RouterHistory' data used in
 *  - RouterHistoryState, and
 *  - routerHistoryReducer
 *
 *  Note: replace if already defined in another module
 */

/* tslint:disable:no-empty-interface */
export interface RouterHistoryState {
  previousRouter: RouterStateUrl,
  currentRouter: RouterStateUrl,
}

export interface RouterHistoryPartialState {
  readonly [ROUTERHISTORY_FEATURE_KEY]: RouterHistoryState;
}

export const initialState: RouterHistoryState = {
  previousRouter: {
    url: '/',
    params: {},
    queryParams: {}
  },
  currentRouter: {
    url: '/',
    params: {},
    queryParams: {}
  }
};

export function routerHistoryReducer(
  state: RouterHistoryState = initialState,
  action: RouterHistoryAction
): RouterHistoryState {
  switch (action.type) {
    case RouterHistoryActionTypes.RouterHistoryUpdated: {
      state = {
        previousRouter: { ...state.currentRouter },
        currentRouter: action.payload
      };
      break;
    }
  }
  return state;
}

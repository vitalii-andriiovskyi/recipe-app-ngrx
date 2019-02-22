import { Action } from '@ngrx/store';

import { RouterStateUrl } from '@recipe-app-ngrx/utils';

export enum RouterHistoryActionTypes {
  RouterHistoryUpdated = '[RouterHistory API] Update RouterHistory'
}


export class RouterHistoryUpdated implements Action {
  readonly type = RouterHistoryActionTypes.RouterHistoryUpdated;
  constructor(public payload: RouterStateUrl) {}
}

export type RouterHistoryAction =
  | RouterHistoryUpdated;

export const fromRouterHistoryActions = {
  RouterHistoryUpdated
};

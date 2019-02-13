import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';

import { CustomRouterStateSerializer } from '@recipe-app-ngrx/utils';
import { RouterHistoryPartialState } from './router-history.reducer';
import {
  RouterHistoryUpdated,
  RouterHistoryActionTypes
} from './router-history.actions';

@Injectable()
export class RouterHistoryEffects {
  @Effect() updateRouterHistory$ = this.actions$.pipe(
    ofType(ROUTER_NAVIGATION),
    map((action: RouterNavigationAction) => new CustomRouterStateSerializer().serialize(action.payload.routerState)),
    map(routerState => new RouterHistoryUpdated(routerState))
  );

  constructor(
    private actions$: Actions
  ) {}
}

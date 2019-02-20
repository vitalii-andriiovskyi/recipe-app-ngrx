import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';

import { CustomRouterStateSerializer, RouterStateUrl } from '@recipe-app-ngrx/utils';
import { RouterHistoryPartialState } from './router-history.reducer';
import {
  RouterHistoryUpdated,
  RouterHistoryActionTypes
} from './router-history.actions';

@Injectable()
export class RouterHistoryEffects {
  @Effect() updateRouterHistory$ = this.actions$.pipe(
    ofType(ROUTER_NAVIGATION),
    map((action: RouterNavigationAction) => action.payload.routerState as unknown as RouterStateUrl),
    map(routerState => new RouterHistoryUpdated(routerState))
  );

  constructor(
    private actions$: Actions
  ) {}
}

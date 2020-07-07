import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { RouterHistoryPartialState } from './router-history.reducer';
import { routerHistoryQuery } from './router-history.selectors';

@Injectable()
export class RouterHistoryFacade {
  currentRouter$ = this.store.pipe(select(routerHistoryQuery.getCurrentRouter));
  previousRouter$ = this.store.pipe(select(routerHistoryQuery.getPreviousRouter));
  
  constructor(private store: Store<RouterHistoryPartialState>) {}

  
}

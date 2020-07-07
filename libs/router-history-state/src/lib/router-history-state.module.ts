import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ROUTERHISTORY_FEATURE_KEY, initialState as routerHistoryInitialState, routerHistoryReducer } from './+state/router-history.reducer';
import { RouterHistoryEffects } from './+state/router-history.effects';
import { RouterHistoryFacade } from './+state/router-history.facade';

@NgModule({
  imports: [
    CommonModule, 
    StoreModule.forFeature(ROUTERHISTORY_FEATURE_KEY, routerHistoryReducer, { initialState: routerHistoryInitialState }),
    EffectsModule.forFeature([RouterHistoryEffects])
  ],
  providers: [RouterHistoryFacade]
})
export class RouterHistoryStateModule {}

import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFirst } from '@nrwl/nx/testing';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';

import { NxModule } from '@nrwl/nx';

import { RouterHistoryEffects } from './router-history.effects';
import { RouterHistoryFacade } from './router-history.facade';

import { routerHistoryQuery } from './router-history.selectors';
import {
  RouterHistoryUpdated,
} from './router-history.actions';
import {
  RouterHistoryState,
  initialState,
  routerHistoryReducer
} from './router-history.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterStateUrl } from '@recipe-app-ngrx/utils';

interface TestSchema {
  routerHistory: RouterHistoryState;
}

describe('RouterHistoryFacade', () => {
  let facade: RouterHistoryFacade;
  let store: Store<TestSchema>;

  describe('used in NgModule', () => {
    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature('routerHistory', routerHistoryReducer, {
            initialState
          }),
          EffectsModule.forFeature([RouterHistoryEffects])
        ],
        providers: [RouterHistoryFacade]
      })
      class CustomFeatureModule {}

      @NgModule({
        imports: [
          NxModule.forRoot(),
          StoreModule.forRoot({}),
          EffectsModule.forRoot([]),
          CustomFeatureModule,
        ]
      })
      class RootModule {}
      TestBed.configureTestingModule({ imports: [RootModule] });

      store = TestBed.get(Store);
      facade = TestBed.get(RouterHistoryFacade);
    });

    /**
     * Use `RouterHistoryUpdated` to manually submit list for state management
     */
    it('currentRouter$ should return current router', async done => {
      try {
        let currentRouter = await readFirst(facade.currentRouter$);

        expect(currentRouter.url).toBe(initialState.currentRouter.url);
        // currentRouter.params and initialState.currentRouter.params are different empty objects and can't be compared 
        expect(currentRouter.params).toBeTruthy('params');
        expect(Object.values(currentRouter.params).length).toBe(0, 'params');
        // currentRouter.queryParams and initialState.currentRouter.queryParams are different empty objects and can't be compared 
        expect(currentRouter.queryParams).toBeTruthy('queryParams');
        expect(Object.values(currentRouter.queryParams).length).toBe(0, 'queryParams');

        // update routerStateUrl
        let routerState: RouterStateUrl = {
          url: 'recipes/desserts',
          params: { id: 'desserts' },
          queryParams: { cat: 'some-cat' }
        };

        store.dispatch( new RouterHistoryUpdated(routerState));

        currentRouter = await readFirst(facade.currentRouter$);

        expect(currentRouter.url).toBe(routerState.url);
        expect(currentRouter.params).toBe(routerState.params);
        expect(currentRouter.queryParams).toBe(routerState.queryParams);
        
        // update routerStateUrl
        routerState = {
          url: 'recipe/salad',
          params: { id: 'salad' },
          queryParams: { }
        };

        store.dispatch( new RouterHistoryUpdated(routerState));
        currentRouter = await readFirst(facade.currentRouter$);

        expect(currentRouter.url).toBe(routerState.url);
        expect(currentRouter.params).toBe(routerState.params);
        expect(currentRouter.queryParams).toBe(routerState.queryParams);
        
        done();
      } catch (err) {
        done.fail(err);
      }
    });

    it('previousRouter$ should return previous router', async done => {
      try {
        let previousRouter = await readFirst(facade.previousRouter$);
        let currentRouter = await readFirst(facade.currentRouter$);

        expect(previousRouter.url).toBe(initialState.previousRouter.url);
        // previousRouter.params and initialState.previousRouter.params are different empty objects and can't be compared 
        expect(previousRouter.params).toBeTruthy('params');
        expect(Object.values(previousRouter.params).length).toBe(0, 'params');
        // previousRouter.queryParams and initialState.previousRouter.queryParams are different empty objects and can't be compared 
        expect(previousRouter.queryParams).toBeTruthy('queryParams');
        expect(Object.values(previousRouter.queryParams).length).toBe(0, 'queryParams');
        
        // update routerStateUrl
        let routerState: RouterStateUrl = {
          url: 'recipes/desserts',
          params: { id: 'desserts' },
          queryParams: { cat: 'some-cat' }
        };

        store.dispatch( new RouterHistoryUpdated(routerState));
        previousRouter = await readFirst(facade.previousRouter$);

        
        // current router becomes previous (in this case initialState.previousRouter), new router becomes current
        expect(previousRouter.url).toBe(initialState.previousRouter.url);
        // expect(previousRouter.params).toBe(initialState.previousRouter.params);
        // expect(previousRouter.queryParams).toBe(initialState.previousRouter.queryParams);
        
        // previousRouter.params and initialState.previousRouter.params are different empty objects and can't be compared 
        expect(previousRouter.params).toBeTruthy('params');
        expect(Object.values(previousRouter.params).length).toBe(0, 'params');
        // previousRouter.queryParams and initialState.previousRouter.queryParams are different empty objects and can't be compared 
        expect(previousRouter.queryParams).toBeTruthy('queryParams');
        expect(Object.values(previousRouter.queryParams).length).toBe(0, 'queryParams');

        currentRouter = await readFirst(facade.currentRouter$);

        // update routerStateUrl
        routerState = {
          url: 'recipe/salad',
          params: { id: 'salad' },
          queryParams: { }
        };

        store.dispatch( new RouterHistoryUpdated(routerState));

        previousRouter = await readFirst(facade.previousRouter$);

        // current router becomes previous, new router becomes current
        expect(previousRouter.url).toBe(currentRouter.url);
        expect(previousRouter.params).toBe(currentRouter.params);
        expect(previousRouter.queryParams).toBe(currentRouter.queryParams);

        done();
      } catch (err) {
        done.fail(err);
      }
    });
  });
});

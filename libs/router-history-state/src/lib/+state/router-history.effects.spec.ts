import { TestBed, async } from '@angular/core/testing';

import { Observable } from 'rxjs';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { NxModule } from '@nrwl/nx';
import { DataPersistence } from '@nrwl/nx';
import { hot, cold } from '@nrwl/nx/testing';

import { RouterHistoryEffects } from './router-history.effects';
import {
  RouterHistoryUpdated,
} from './router-history.actions';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterStateUrl } from '@recipe-app-ngrx/utils';

describe('RouterHistoryEffects', () => {
  let actions: Observable<any>;
  let effects: RouterHistoryEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])
      ],
      providers: [
        RouterHistoryEffects,
        DataPersistence,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(RouterHistoryEffects);
  });

  describe('updateRouterHistory$', () => {
    it(`should return action 'RouterHistoryUpdated'`, () => {
      const action = {
        type: ROUTER_NAVIGATION,
        payload: {
          routerState: {
            url: 'recipes/desserts',
            root: {
              firstChild: {
                routeConfig: {
                  path: 'recipes/desserts'
                },
                paramMap: {
                  get: (id: string) => 'desserts'
                },
                params: { id: 'desserts' },
              } as unknown as ActivatedRouteSnapshot,
              queryParams: { cat: 'some-cat' }
            } as unknown as ActivatedRouteSnapshot
          },
          event: {}
        }
      } as unknown as RouterNavigationAction;

      const router: RouterStateUrl = {
        url: 'recipes/desserts',
        params: { id: 'desserts' },
        queryParams: { cat: 'some-cat' }
      }

      actions = hot('-a---', { a: action });
      const completion = new RouterHistoryUpdated(router);
      const expected = cold('-b', { b: completion });
      expect(effects.updateRouterHistory$).toBeObservable(expected);
    });
  });
});

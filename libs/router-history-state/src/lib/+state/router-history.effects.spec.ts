import { TestBed, async } from '@angular/core/testing';

import { Observable } from 'rxjs';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { NxModule } from '@nrwl/angular';
import { DataPersistence } from '@nrwl/angular';
import { hot, cold } from '@nrwl/angular/testing';

import { RouterHistoryEffects } from './router-history.effects';
import { RouterHistoryUpdated } from './router-history.actions';
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

    effects = TestBed.inject(RouterHistoryEffects);
  });

  describe('updateRouterHistory$', () => {
    it(`should return action 'RouterHistoryUpdated'`, () => {
      const action = ({
        type: ROUTER_NAVIGATION,
        payload: {
          // The app uses CustomRouterSerializer. Therefore the payload.routerState will allways have the type of RouterStateUrl
          routerState: {
            url: 'recipes/desserts',
            params: { id: 'desserts' },
            queryParams: { cat: 'some-cat' },
            routeConfig: {
              path: 'recipes/desserts'
            }
          },
          event: {}
        }
      } as unknown) as RouterNavigationAction;

      const router: RouterStateUrl = {
        url: 'recipes/desserts',
        params: { id: 'desserts' },
        queryParams: { cat: 'some-cat' },
        routeConfig: {
          path: 'recipes/desserts'
        }
      };

      actions = hot('-a---', { a: action });
      const completion = new RouterHistoryUpdated(router);
      const expected = cold('-b', { b: completion });
      expect(effects.updateRouterHistory$).toBeObservable(expected);
    });
  });
});

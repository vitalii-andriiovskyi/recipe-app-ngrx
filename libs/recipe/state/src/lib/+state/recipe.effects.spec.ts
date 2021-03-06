import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import {
  HttpParams,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { ActivatedRouteSnapshot, ParamMap } from '@angular/router';
import { Component, NgModule } from '@angular/core';

import { Observable, of, from } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import {
  StoreRouterConnectingModule,
  ROUTER_NAVIGATION,
  RouterNavigationAction
} from '@ngrx/router-store';

import {
  EntityActionFactory,
  EntityOp,
  EntityDataModule,
  ENTITY_METADATA_TOKEN,
  EntityCollectionReducerRegistry,
  EntityDataService,
  DataServiceError,
  RequestData,
  EntityActionDataServiceError
} from '@ngrx/data';

import { NxModule } from '@nrwl/angular';
import { hot, cold } from '@nrwl/angular/testing';

import { RecipeEffects } from './recipe.effects';
import { RecipeEntityOp } from './recipe.actions';
import { RecipeDataService } from '../services/recipe-data.service';
import { RecipeFilters } from '@recipe-app-ngrx/models';
import { RecipeEntityCollectionService } from '../services/recipe-entity-collection.service';
import { recipeEntityMetadata } from '../recipe-entity-metadata';
import { ENV_RCP, LogService, CustomRouterStateSerializer } from '@recipe-app-ngrx/utils';

describe('RecipeEffects', () => {
  let actions$: Observable<any>;
  let effects: RecipeEffects;
  let entityActionFactory: EntityActionFactory;
  let getTotalNRecipesSpy: jasmine.Spy;
  let getCountFilteredRecipesSpy: jasmine.Spy;
  let recipeEntityCollectionService: RecipeEntityCollectionService;

  beforeEach(() => {
    const recipeDataServiceSpy = jasmine.createSpyObj('RecipeDataService', [
      'getTotalNRecipes',
      'getCountFilteredRecipes'
    ]);
    getTotalNRecipesSpy = recipeDataServiceSpy.getTotalNRecipes;
    getCountFilteredRecipesSpy = recipeDataServiceSpy.getCountFilteredRecipes;

    @NgModule({
      imports: [],
      providers: [
        {
          provide: ENTITY_METADATA_TOKEN,
          multi: true,
          useValue: recipeEntityMetadata
        },
        { provide: RecipeDataService, useValue: recipeDataServiceSpy },
        EntityCollectionReducerRegistry
      ]
    })
    class CustomFeatureModule {
      constructor(
        entityDataService: EntityDataService,
        recipeDataService: RecipeDataService
      ) {
        entityDataService.registerService('Recipe', recipeDataService);
      }
    }

    TestBed.configureTestingModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        StoreRouterConnectingModule.forRoot({
          serializer: CustomRouterStateSerializer
        }),
        EntityDataModule.forRoot({}),
        RouterTestingModule.withRoutes([
          { path: 'recipes:/id', component: TestComponent }
        ]),
        HttpClientTestingModule,
        CustomFeatureModule
      ],
      providers: [
        RecipeEffects,
        provideMockActions(() => actions$),
        EntityActionFactory,
        { provide: ENV_RCP, useValue: { production: false } },
        LogService,
        RecipeEntityCollectionService
      ],
      declarations: [TestComponent]
    });

    effects = TestBed.inject(RecipeEffects);
    entityActionFactory = TestBed.inject(EntityActionFactory);
    recipeEntityCollectionService = TestBed.inject(RecipeEntityCollectionService);
  });

  describe('totalNRecipes$', () => {
    it('should return SUCCESS action, when the server responds with a number ', () => {
      const action = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_TOTAL_N_RECIPES as unknown) as EntityOp
      );
      const completion = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_TOTAL_N_RECIPES_SUCCESS as unknown) as EntityOp,
        1000,
        { tag: 'API' }
      );

      actions$ = hot('-a---', { a: action });
      const response = cold('-a|', { a: 1000 });
      const expected = cold('--b', { b: completion });

      getTotalNRecipesSpy.and.returnValue(response);
      expect(effects.totalNRecipes$).toBeObservable(expected);
    });

    it('should return ERROR action, when the server responds with an error ', () => {
      const options: RecipeFilters = {
        category: 'Bread',
        username: '',
        page: 1,
        itemsPerPage: 6
      };
      const reqData: RequestData = {
        method: 'GET',
        url: 'api/recipes/countFilteredRecipes'
      };
      const httpErrorRes = new HttpErrorResponse({
        error:
          'Error occured while trying to proxy to: localhost:4200/api/recipes/countFilteredRecipes',
        status: 504,
        statusText: 'Gateway Timeout',
        url: 'http://localhost:4200/api/recipes/countFilteredRecipes'
      });

      const err = new DataServiceError(httpErrorRes, reqData);

      const action = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_TOTAL_N_RECIPES as unknown) as EntityOp
      );
      const errorData: EntityActionDataServiceError = {
        error: err,
        originalAction: action
      };
      const completion = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_TOTAL_N_RECIPES_ERROR as unknown) as EntityOp,
        errorData,
        { tag: 'API' }
      );

      actions$ = hot('-a---', { a: action });
      const response = cold('-#', {}, err);
      const expected = cold('--b', { b: completion });

      getTotalNRecipesSpy.and.returnValue(response);
      expect(effects.totalNRecipes$).toBeObservable(expected);
    });
  });

  describe(`queryCountFilteredRecipes$`, () => {
    it(`should return SUCCESS action, when the server responds with a number`, () => {
      const countFilteredRecipes = 101;
      const filters: RecipeFilters = {
        category: 'Bread',
        username: '',
        page: 1,
        itemsPerPage: 6
      };
      const action = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown) as EntityOp,
        filters
      );
      const completion = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_SUCCESS as unknown) as EntityOp,
        countFilteredRecipes,
        { tag: 'API' }
      );

      actions$ = hot('-a---', { a: action });
      const response = cold('-a|', { a: countFilteredRecipes });
      const expected = cold('--b', { b: completion });

      getCountFilteredRecipesSpy.and.returnValue(response);
      expect(effects.queryCountFilteredRecipes$).toBeObservable(expected);
    });

    it('should return ERROR action, when the server responds with an error ', () => {
      const options: RecipeFilters = {
        category: 'Bread',
        username: '',
        page: 1,
        itemsPerPage: 6
      };
      const reqData: RequestData = {
        method: 'GET',
        url: 'api/recipes/countFilteredRecipes'
      };
      const httpErrorRes = new HttpErrorResponse({
        error:
          'Error occured while trying to proxy to: localhost:4200/api/recipes/countFilteredRecipes',
        status: 504,
        statusText: 'Gateway Timeout',
        url: 'http://localhost:4200/api/recipes/countFilteredRecipes'
      });

      const err = new DataServiceError(httpErrorRes, reqData);

      const action = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown) as EntityOp,
        options
      );
      const errorData: EntityActionDataServiceError = {
        error: err,
        originalAction: action
      };
      const completion = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_ERROR as unknown) as EntityOp,
        errorData,
        { tag: 'API' }
      );

      actions$ = hot('-a---', { a: action });
      const response = cold('-#', null, err);
      getCountFilteredRecipesSpy.and.returnValue(response);
      const expected = cold('--b', { b: completion });

      expect(effects.queryCountFilteredRecipes$).toBeObservable(expected);
    });
  });

  describe('navigateToRecipes$', () => {
    it(`should return 'FILTERS_UPDATED' and 'QUERY_COUNT_FILTERED_RECIPES' actions; category case`, () => {
      const action = ({
        type: ROUTER_NAVIGATION,
        payload: {
          // The app uses CustomRouterSerializer. Therefore the payload.routerState will allways have the type of RouterStateUrl
          routerState: {
            url: 'recipes/desserts',
            params: { id: 'desserts' },
            queryParams: {
              page: '1',
              itemsPage: '6'
            },
            routeConfig: {
              path: 'recipes/:id'
            }
          },
          event: {}
        }
      } as unknown) as RouterNavigationAction;

      const filters: RecipeFilters = {
        category: 'desserts',
        username: null,
        page: 1,
        itemsPerPage: 6
      };

      const completion1 = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.FILTERS_UPDATED as unknown) as EntityOp,
        filters,
        { tag: 'API' }
      );
      const completion2 = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown) as EntityOp,
        filters,
        { tag: 'API' }
      );

      actions$ = hot('-a---', { a: action });

      const expected = cold('-(bc)', { b: completion1, c: completion2 });
      expect(effects.navigateToRecipes$).toBeObservable(expected);
    });

    it(`should return 'FILTERS_UPDATED' actions; 'all' case`, () => {
      const action = ({
        type: ROUTER_NAVIGATION,
        payload: {
          // The app uses CustomRouterSerializer. Therefore the payload.routerState will allways have the type of RouterStateUrl
          routerState: {
            url: 'recipes/all',
            params: { id: 'all' },
            queryParams: {
              page: '1',
              itemsPage: '6'
            },
            routeConfig: {
              path: 'recipes/:id'
            }
          },
          event: {}
        }
      } as unknown) as RouterNavigationAction;

      const filters: RecipeFilters = {
        category: null,
        username: null,
        page: 1,
        itemsPerPage: 6
      };

      const completion = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.FILTERS_UPDATED as unknown) as EntityOp,
        filters,
        { tag: 'API' }
      );
      const completion2 = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown) as EntityOp,
        filters,
        { tag: 'API' }
      );

      actions$ = hot('-a---', { a: action });

      // The navigation to route '/recipes/all' will always define filters as it is the variable `filters`;
      const expected = cold('-(bc)', { b: completion, c: completion2 });
      expect(effects.navigateToRecipes$).toBeObservable(expected);
    });

    it(`should return 'FILTERS_UPDATED' and 'QUERY_COUNT_FILTERED_RECIPES' actions; username case`, () => {
      const action = ({
        type: ROUTER_NAVIGATION,
        payload: {
          // The app uses CustomRouterSerializer. Therefore the payload.routerState will allways have the type of RouterStateUrl
          routerState: {
            url: 'recipes/rcp_user',
            params: { id: 'rcp_user' },
            queryParams: {
              page: '1',
              itemsPage: '6'
            },
            routeConfig: {
              path: 'recipes/:id'
            }
          },
          event: {}
        }
      } as unknown) as RouterNavigationAction;

      const filters: RecipeFilters = {
        category: null,
        username: 'rcp_user',
        page: 1,
        itemsPerPage: 6
      };

      const completion1 = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.FILTERS_UPDATED as unknown) as EntityOp,
        filters,
        { tag: 'API' }
      );
      const completion2 = entityActionFactory.create(
        'Recipe',
        (RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown) as EntityOp,
        filters,
        { tag: 'API' }
      );

      actions$ = hot('-a---', { a: action });

      const expected = cold('-(bc)', { b: completion1, c: completion2 });
      expect(effects.navigateToRecipes$).toBeObservable(expected);
    });

    // it(`should return just 'FILTERS_UPDATED' action when oldFilters==newFilters`, () => {
    //   // Should work but effects are mocked and don't dispatch actions. Therefore the reducer don't get called and filters don't get updated
    //   const action = {
    //     type: ROUTER_NAVIGATION,
    //     payload: {
    //       // The app uses CustomRouterSerializer. Therefore the payload.routerState will allways have the type of RouterStateUrl
    //       routerState: {
    //         url: 'recipes/all',
    //         params: { id: 'all' },
    //         queryParams: {
    //           page: '1',
    //           itemsPage: '5'
    //         },
    //         routeConfig: {
    //           path: 'recipes/:id'
    //         }
    //       },
    //       event: {}
    //     }
    //   } as unknown as RouterNavigationAction;

    //   const action2 = {
    //     type: ROUTER_NAVIGATION,
    //     payload: {
    //       // The app uses CustomRouterSerializer. Therefore the payload.routerState will allways have the type of RouterStateUrl
    //       routerState: {
    //         url: 'recipes/all',
    //         params: { id: 'all' },
    //         queryParams: {
    //           page: '2',
    //           itemsPage: '5'
    //         },
    //         routeConfig: {
    //           path: 'recipes/:id'
    //         }
    //       },
    //       event: {}
    //     }
    //   } as unknown as RouterNavigationAction;

    //   const filters1: RecipeFilters = {
    //     category: null,
    //     username: null,
    //     page: 1,
    //     itemsPerPage: 5
    //   }
    //   const filters2: RecipeFilters = {
    //     category: null,
    //     username: null,
    //     page: 2,
    //     itemsPerPage: 5
    //   }

    //   const completion1 = entityActionFactory.create('Recipe', RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters1, {tag: 'API'});
    //   const completion2 = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown as EntityOp, filters1, { tag: 'API' });
    //   const completion3 = entityActionFactory.create('Recipe', RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters2, {tag: 'API'});

    //   actions$ =        hot('-a---------b-', {a: action, b: action2});

    //   const expected = cold('-(bc)------d', { b: completion1, c: completion2, d: {completion3}});
    //   expect(effects.navigateToRecipes$).toBeObservable(expected)
    // });
  });
});

@Component({
  template: `
    <div>test</div>
  `
})
class TestComponent {}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route } from '@angular/router';

import { Effect, Actions, ofType } from '@ngrx/effects';
import { RouterNavigationAction, ROUTER_NAVIGATION } from '@ngrx/router-store';

import { ofEntityOp, EntityActionFactory, EntityOp, EntityCache, EntityAction, DataServiceError, EntityActionDataServiceError, Logger } from '@ngrx/data';
import { of } from 'rxjs';
import { exhaustMap, catchError, map, filter, flatMap, tap, withLatestFrom } from 'rxjs/operators';

import { RecipeActionTypes, RecipeEntityOp } from './recipe.actions';
import { RecipeDataService } from '../services/recipe-data.service';
import { RecipeFilters, recipeCategoryAll } from '@recipe-app-ngrx/models';
import { isRecipeCategory } from '../services/utils';
import { recipeEntityMetadata } from '../recipe-entity-metadata';
import { RecipeEntityCollectionService } from '../services/recipe-entity-collection.service';
import { RouterStateUrl } from '@recipe-app-ngrx/utils';

@Injectable()
export class RecipeEffects {
  @Effect() totalNRecipes$ = this._totalNRecipes();
  
  @Effect() queryCountFilteredRecipes$ = this._queryCountFilteredRecipes();

  @Effect() navigateToRecipes$ = this._handleNavigation('recipes/:id', (route: RouterStateUrl, oldFilters: RecipeFilters) => {
    const id = route.params['id'],
          isCat = isRecipeCategory(id),
          isCatAll = id === recipeCategoryAll.url,
          filters: RecipeFilters = {
            category: (isCat && id) ? id : null,
            username: (!isCat && !isCatAll && id) ? id : null,
            page: +route.queryParams['page'] || 0,
            itemsPerPage: +route.queryParams['itemsPage'] || oldFilters.itemsPerPage || recipeEntityMetadata.Recipe.additionalCollectionState['filters'].itemsPerPage
          },

          filtersUpdatedAction: EntityAction = this.entityActionFactory.create('Recipe', RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });

    // This comparing prevents the additional call to the server to find out the number of recipes according to filters
    // when filters don't change. But it leads to trap when the server respondes the error. The code sets to `countFilteredRecipes` the  `state.ids.length`
    // and it won't changed until the filters get changed
    // Solution: maybe add special 'errorMarker' to the state and set it to `true` in the case of the error
    // if (errorMarker === true) dispatch RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES
    // For this demo app, current situation is acceptable
    if (oldFilters.category === filters.category && oldFilters.username === filters.username) {
      return [filtersUpdatedAction];
    }
    
    const loadCountFilteredRecipesAction: EntityAction = this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown as EntityOp, filters, { tag: 'API' });
    
    return [filtersUpdatedAction, loadCountFilteredRecipesAction];
  });

  constructor(
    private actions$: Actions,
    private recipeDataService: RecipeDataService,
    private entityActionFactory: EntityActionFactory,
    private recipeEntityCollectionService: RecipeEntityCollectionService,
    private logger: Logger
  ) { }

  private _handleNavigation(segment: string, callback: (a: RouterStateUrl, filters?: RecipeFilters) => EntityAction[]) {
    return this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      map(firstSegment),
      filter(s => s && s.routeConfig.path === segment),
      withLatestFrom(this.recipeEntityCollectionService.filters$),
      flatMap(a => callback(a[0], a[1]))
    );
  }

  private _queryCountFilteredRecipes() {
    // this variable could be omited using 'forkJoin'. But I don't know how to pass EntityAction to 'catchError'
    let entityAction: EntityAction;
    
    return this.actions$.pipe(
      ofEntityOp([RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES]),
      tap(action => entityAction = action),
      exhaustMap(action => this.recipeDataService.getCountFilteredRecipes(action.payload.data).pipe(
        map(data => this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_SUCCESS as unknown as EntityOp, data, {tag: 'API'})),
        catchError(err => {
          const errorData: EntityActionDataServiceError = this._makeEntityActionDataServiceErr(err, entityAction);
          this.logger.error(errorData);
          return of(this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_ERROR as unknown as EntityOp, errorData, {tag: 'API'})) 
        })
      )),
    );
  }

  private _totalNRecipes() {
    // this variable could be omited using 'forkJoin'. But I don't know how to pass EntityAction to 'catchError'
    let entityAction: EntityAction;

    return this.actions$.pipe(
      ofEntityOp([RecipeEntityOp.QUERY_TOTAL_N_RECIPES]),
      tap(action => entityAction = action),
      exhaustMap(action => this.recipeDataService.getTotalNRecipes().pipe(
        map(data => this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_SUCCESS as unknown as EntityOp, data, {tag: 'API'})),
        catchError(err => {
          const errorData: EntityActionDataServiceError = this._makeEntityActionDataServiceErr(err, entityAction);
          this.logger.error(errorData);
          return of(this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_ERROR as unknown as EntityOp, errorData, {tag: 'API'}))
        })
      )),
    );
  }

  private _makeEntityActionDataServiceErr(err: any, action: EntityAction): EntityActionDataServiceError {
    const error = err instanceof DataServiceError ? err : new DataServiceError(err, null);
    return { error, originalAction: action };
  }
}

function firstSegment(ra: RouterNavigationAction): RouterStateUrl {
  return ra.payload.routerState as unknown as RouterStateUrl;
}

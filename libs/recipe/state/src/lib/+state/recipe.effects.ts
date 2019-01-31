import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { Effect, Actions, ofType } from '@ngrx/effects';
import { RouterNavigationAction, ROUTER_NAVIGATION } from '@ngrx/router-store';

import { ofEntityOp, EntityActionFactory, EntityOp, EntityCache, EntityAction } from 'ngrx-data';
import { of } from 'rxjs';
import { exhaustMap, catchError, map, filter, flatMap, tap } from 'rxjs/operators';

import { RecipeActionTypes, RecipeEntityOp } from './recipe.actions';
import { RecipeDataService } from '../services/recipe-data.service';
import { RecipeFilters } from '@recipe-app-ngrx/models';
import { isRecipeCategory } from '../services/utils';
import { recipeEntityMetadata } from '../recipe-entity-metadata';

@Injectable()
export class RecipeEffects {
  @Effect() totalNRecipes$ = this.actions$.pipe(
    ofEntityOp([RecipeEntityOp.QUERY_TOTAL_N_RECIPES]),
    exhaustMap(action => this.recipeDataService.getTotalNRecipes().pipe(
      map(data => this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_SUCCESS as unknown as EntityOp, data, {tag: 'API'})),
      catchError(err => of(this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_ERROR as unknown as EntityOp, null, {tag: 'API'})))
    )),
  );

  @Effect() queryCountFilteredRecipes$ = this.actions$.pipe(
    ofEntityOp([RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES]),
    exhaustMap(action => this.recipeDataService.getCountFilteredRecipes(action.payload.data).pipe(
      map(data => this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_SUCCESS as unknown as EntityOp, data, {tag: 'API'})),
      catchError(err => of(this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_ERROR as unknown as EntityOp, null, {tag: 'API'})))
    )),
  );

  @Effect() navigateToRecipes$ = this._handleNavigation('recipes/:id', (route: ActivatedRouteSnapshot) => {
    const id = route.paramMap.get('id');
    const isCat = isRecipeCategory(id);
    const filters: RecipeFilters = {
      category: (isCat && id) ? id : null,
      username: (!isCat && id) ? id : null,
      page: +route.params['page'] || 1,
      itemsPerPage: +route.params['itemsPage'] || recipeEntityMetadata.Recipe.additionalCollectionState['filters'].itemsPerPage
    };

    const filtersUpdatedAction: EntityAction = this.entityActionFactory.create('Recipe', RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });
    const loadCountFilteredRecipesAction: EntityAction = this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown as EntityOp, filters, { tag: 'API' });
    
    return [filtersUpdatedAction, loadCountFilteredRecipesAction];
  });

  constructor(
    private actions$: Actions,
    private recipeDataService: RecipeDataService,
    private entityActionFactory: EntityActionFactory,
  ) { }

  private _handleNavigation(segment: string, callback: (a: ActivatedRouteSnapshot) => EntityAction[]) {
    return this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      map(firstSegment),
      filter(s => s && s.routeConfig.path === segment),
      flatMap(a => callback(a))
    );
  }
}

function firstSegment(ra: RouterNavigationAction): ActivatedRouteSnapshot {
  return ra.payload.routerState.root.firstChild;
}

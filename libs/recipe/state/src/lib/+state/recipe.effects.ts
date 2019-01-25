import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/nx';

import { RecipeActionTypes, RecipeEntityOp } from './recipe.actions';
import { ofEntityOp, EntityActionFactory, EntityOp } from 'ngrx-data';
import { exhaustMap, catchError, map } from 'rxjs/operators';
import { RecipeDataService } from '../services/recipe-data.service';
import { of } from 'rxjs';

@Injectable()
export class RecipeEffects {
  @Effect() totalNRecipes$ = this.actions$.pipe(
    ofEntityOp([RecipeEntityOp.QUERY_TOTAL_N_RECIPES]),
    exhaustMap(action => this.recipeDataService.getTotalNRecipes().pipe(
      map(data => this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_SUCCESS as unknown as EntityOp, data, {tag: 'API'})),
      catchError(err => of(this.entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_ERROR as unknown as EntityOp, null, {tag: 'API'})))
    )),
  );

  constructor(
    private actions$: Actions,
    private recipeDataService: RecipeDataService,
    private entityActionFactory: EntityActionFactory
  ) {}
}

import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCacheDispatcher, EntityCollectionServiceElementsFactory, EntityActionOptions, EntityOp } from 'ngrx-data';
import { Recipe } from '@recipe-app-ngrx/models';
import { TemporaryIdGenerator } from '@recipe-app-ngrx/utils';
import { of, Observable, merge } from 'rxjs';
import { switchMap, filter, mergeMap, map } from 'rxjs/operators';
import { RecipeEntityOp } from '../+state/recipe.actions';

@Injectable({
  providedIn: 'root'
})
export class RecipeEntityCollectionService extends EntityCollectionServiceBase<Recipe>{

  constructor(
    private entityCacheDispatcher: EntityCacheDispatcher,
    private idGenerator: TemporaryIdGenerator,
    private serviceElementsFactory: EntityCollectionServiceElementsFactory
  ) { 
    super('Recipe', serviceElementsFactory);
  }

  add(recipe: Recipe, options?: EntityActionOptions) {
    const recipeWithoutId$: Observable<Recipe> = of(recipe).pipe(
      filter(rcp => !rcp.id),
      mergeMap(rcp => 
        (this.selectors$ as any).totalNRecipes$.pipe(
          map(totalNRecipes => {
            const id = this.idGenerator.createId(totalNRecipes as number);
            return { ...rcp, id }
          })
        )
      )
    );

    const recipeWithId$: Observable<Recipe> = of(recipe).pipe(
      filter(rcp => !!rcp.id)
    )

    const result$ = merge(recipeWithoutId$, recipeWithId$).pipe(
      switchMap(rcp => super.add(rcp))
    )

    return result$;
  }

  loadTotalNRecipes(tag: string) {
    this.createAndDispatch(RecipeEntityOp.QUERY_TOTAL_N_RECIPES as unknown as EntityOp, null, { tag: tag});
  }

  /**
   * Dispatches action `RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES`
   * @param tag - Tag is message containing info about the place calling the method; e.g. Recipe Page, API
   * @param data - Data are the options for `http.get()` method. In this case, object should contain the prop `params` with object similar to `{type: 'category', value: 'Dessers' }` or `{type: 'username', value: 'username' }`
   */
  loadCountFilteredRecipes(tag: string, data: any) {
    this.createAndDispatch(RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown as EntityOp, data, {tag: tag});
  }
  
}

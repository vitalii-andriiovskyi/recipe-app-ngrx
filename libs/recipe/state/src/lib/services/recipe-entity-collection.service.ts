import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCacheDispatcher, EntityCollectionServiceElementsFactory, EntityActionOptions, EntityOp } from 'ngrx-data';
import { Recipe, RecipeFilters } from '@recipe-app-ngrx/models';
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
   * @param filters - Filters are the current RecipeFilters which are in the `state.filters` prop
   */
  loadCountFilteredRecipes(tag: string, filters: RecipeFilters) {
    this.createAndDispatch(RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown as EntityOp, filters, {tag: tag});
  }
  
}

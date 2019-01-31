import { Injectable } from '@angular/core';
import { of, Observable, merge, combineLatest } from 'rxjs';
import { switchMap, filter, mergeMap, map, withLatestFrom, tap } from 'rxjs/operators';
import { EntityCollectionServiceBase, EntityCacheDispatcher, EntityCollectionServiceElementsFactory, EntityActionOptions, EntityOp } from 'ngrx-data';

import { Recipe, RecipeFilters, recipeCategoryAll } from '@recipe-app-ngrx/models';
import { TemporaryIdGenerator } from '@recipe-app-ngrx/utils';
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

  filteredEntitiesByCategory$ = combineLatest((this.selectors$ as any).filters$, this.entities$).pipe(
    filter(data => !!data[0]['category'] && !data[0]['username']),
    map(data => {
      if(data[0]['category'] === recipeCategoryAll.url) return data;

      const filteredEntities: Recipe[] = data[1].filter((recipe: Recipe) => {
        return this.belongToCategory(data[0]['category'], recipe)
      });

      data = [data[0], filteredEntities];
      return data;
    })
  );

  filteredEntitiesByUser$ = combineLatest((this.selectors$ as any).filters$, this.entities$).pipe(
    filter(data => !!data[0]['username'] && !data[0]['category']),
    map(data => {
      const filteredEntities: Recipe[] = data[1].filter((recipe: Recipe) => {
        return this.belongToUser(data[0]['username'], recipe)
      });

      data = [data[0], filteredEntities];
      return data;
    })
  );

  filteredEntitiesByCategoryAndUser$ = combineLatest((this.selectors$ as any).filters$, this.entities$).pipe(
    filter(data => !!data[0]['username'] && !!data[0]['category']),
    map(data => {
      const isRecipeCategoryAll = data[0]['category'] === recipeCategoryAll.url;

      const filteredEntities: Recipe[] = data[1].filter((recipe: Recipe) => {
        const belongsToUser = this.belongToUser(data[0]['username'], recipe);
        const belongsToCategory = isRecipeCategoryAll || this.belongToCategory(data[0]['category'], recipe);
        return  belongsToUser && belongsToCategory;
      });

      data = [data[0], filteredEntities];
      return data;
    })
  );

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

  belongToCategory(category: string, item: Recipe): boolean {
    let result: boolean;
    if (typeof item.category === 'string') {
      result = item.category === category;
    } else {
      result = item.category.indexOf(category) > -1;
    }
    return result;
  }

  belongToUser(username: string, item: Recipe): boolean {
    return username === item.user_username;
  }

}

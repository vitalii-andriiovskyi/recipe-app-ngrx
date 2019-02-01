import { Injectable } from '@angular/core';
import { of, Observable, merge, combineLatest, BehaviorSubject } from 'rxjs';
import { switchMap, filter, mergeMap, map, withLatestFrom, tap, catchError } from 'rxjs/operators';
import { EntityCollectionServiceBase, EntityCacheDispatcher, EntityCollectionServiceElementsFactory, EntityActionOptions, EntityOp, QueryParams } from 'ngrx-data';

import { Recipe, RecipeFilters, recipeCategoryAll } from '@recipe-app-ngrx/models';
import { TemporaryIdGenerator, LogService } from '@recipe-app-ngrx/utils';
import { RecipeEntityOp } from '../+state/recipe.actions';

@Injectable({
  providedIn: 'root'
})
export class RecipeEntityCollectionService extends EntityCollectionServiceBase<Recipe>{

  private _filteredRecipesSubject = new BehaviorSubject<Recipe[]>([]);
  filteredRecipes$: Observable<Recipe[]> = this._filteredRecipesSubject.asObservable();
  
  constructor(
    private entityCacheDispatcher: EntityCacheDispatcher,
    private idGenerator: TemporaryIdGenerator,
    private serviceElementsFactory: EntityCollectionServiceElementsFactory,
    private logger: LogService
  ) { 
    super('Recipe', serviceElementsFactory);
  }

  filters$: Observable<RecipeFilters> = (this.selectors$ as any).filters$;
  countFilteredRecipes$: Observable<number> = (this.selectors$ as any).countFilteredRecipes$;

  filteredEntitiesByCategory$: Observable<[RecipeFilters, Recipe[]]> = combineLatest(this.filters$, this.entities$).pipe(
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

  filteredEntitiesByUser$: Observable<[RecipeFilters, Recipe[]]> = combineLatest(this.filters$, this.entities$).pipe(
    filter(data => !!data[0]['username'] && !data[0]['category']),
    map(data => {
      const filteredEntities: Recipe[] = data[1].filter((recipe: Recipe) => {
        return this.belongToUser(data[0]['username'], recipe)
      });

      data = [data[0], filteredEntities];
      return data;
    })
  );

  filteredEntitiesByCategoryAndUser$: Observable<[RecipeFilters, Recipe[]]> = combineLatest(this.filters$, this.entities$).pipe(
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

  filteredEntitiesByCategoryUserCommon$: Observable<[RecipeFilters, Recipe[]]> = merge(
    this.filteredEntitiesByCategory$,
    this.filteredEntitiesByUser$,
    this.filteredEntitiesByCategoryAndUser$,
  );

  filteredEntitiesByAllFilters$: Observable<Recipe[]> = this.filteredEntitiesByCategoryUserCommon$.pipe(
    map(data => {
      const page = data[0]['page'];
      const itemsPerPage = data[0]['itemsPerPage'];
      const begin = page * itemsPerPage;
      const end = begin + itemsPerPage;

      return data[1].slice(begin, end);
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

  private _hasRecipesAccordingToFilters(data: [number, [RecipeFilters, Recipe[]]]): boolean {
    const filters: RecipeFilters = data[1][0];
    const recipes: Recipe[] = data[1][1];
    const countRecipesRequested = (filters.page + 1) * filters.itemsPerPage;
    const result = Math.min(data[0], countRecipesRequested) <= recipes.length;
    return result;
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

import { defaultSelectId, EntityMetadataMap, PropsFilterFnFactory } from '@ngrx/data';
import { Recipe } from '@recipe-app-ngrx/models';

export const recipeEntityMetadata: EntityMetadataMap = {
  Recipe: {
    sortComparer: sortByDateCreated,
    filterFn: titleFilter,
    // Pessimistic delete; optimistic add and update.
    entityDispatcherOptions: {
      optimisticDelete: false,
      optimisticAdd: true,
      optimisticUpdate: true
    },
    additionalCollectionState: {
      totalNRecipes: 1000000,
      filters: {
        category: '',
        username: null,
        page: 0,
        itemsPerPage: 10
      },
      countFilteredRecipes: 0
    }
  }
};

/** Sort Comparer to sort the entity collection by its name property */
export function sortByDateCreated(a: Recipe, b: Recipe): number {
  return +b.date_created - (+a.date_created);
}

export function titleFilter<T extends {title: string}>(entities: T[], pattern: string) {
  return PropsFilterFnFactory(['title'])(entities, pattern);
}
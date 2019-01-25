import { Action } from '@ngrx/store';
import { EntityAction } from 'ngrx-data';

export enum RecipeActionTypes {
  LoadTotalNRecipes = '[Create Recipe page] Load Total Number Of Recipes',
  TotalNRecipesLoaded = '[API] Total Number Of Recipes Loaded',
  TotalNRecipesLoadError = '[API] Total Number Of Recipes Load Error'
}

export enum RecipeEntityOp {
  QUERY_TOTAL_N_RECIPES = 'ngrx-data/query-total-n-recipes',
  QUERY_TOTAL_N_RECIPES_SUCCESS = 'ngrx-data/query-total-n-recipes/success',
  QUERY_TOTAL_N_RECIPES_ERROR = 'ngrx-data/query-total-n-recipes/error',
}

// export class LoadTotalNRecipes implements Action {
//   readonly type = RecipeActionTypes.LoadTotalNRecipes;
// }

// export class TotalNRecipesLoadError implements Action {
//   readonly type = RecipeActionTypes.TotalNRecipesLoadError;
//   constructor(public payload: any) {}
// }

// export class TotalNRecipesLoaded implements Action {
//   readonly type = RecipeActionTypes.TotalNRecipesLoaded;
//   constructor(public payload: number) {}
// }

// export type RecipeAction = LoadTotalNRecipes | TotalNRecipesLoaded | TotalNRecipesLoadError;

// export const fromRecipeActions = {
//   LoadTotalNRecipes,
//   TotalNRecipesLoaded,
//   TotalNRecipesLoadError
// };

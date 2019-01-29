import { RecipeActionTypes, RecipeEntityOp } from './recipe.actions';
import { EntityCollection, EntityAction } from 'ngrx-data';
import { Recipe } from '@recipe-app-ngrx/models';

const methods = {
  [RecipeEntityOp.QUERY_TOTAL_N_RECIPES_SUCCESS]: (state: EntityCollection<Recipe>, action: EntityAction): EntityCollection<Recipe> => {
    return {
      ...state,
      ...{ totalNRecipes: action.payload.data },
    }
  },
  [RecipeEntityOp.QUERY_TOTAL_N_RECIPES_ERROR]: (state: EntityCollection<Recipe>, action: EntityAction): EntityCollection<Recipe> => {
    return state;
  },
  [RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_SUCCESS]: (state: EntityCollection<Recipe>, action: EntityAction): EntityCollection<Recipe> => {
    return {
      ...state,
      ...{ countFilteredRecipes: action.payload.data },
    }
  },
  [RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_ERROR]: (state: EntityCollection<Recipe>, action: EntityAction): EntityCollection<Recipe> => {
    return {
      ...state,
      ...{ countFilteredRecipes: state.ids.length }, // not sure about state.ids.length; don't know how to get in effects the min number of filtered elements
    }
  },
}

export function recipeReducer(state: EntityCollection<Recipe>, action: EntityAction): EntityCollection<Recipe> {
  state = methods[action.payload.entityOp] ? methods[action.payload.entityOp](state, action) : state;
  // switch (action.payload.entityOp) {
  //   case RecipeEntityOp.QUERY_TOTAL_N_RECIPES: {
  //     state = {
  //       ...state,
  //       ...{ totalNRecipes: action.payload.data },
  //     };
  //     break;
  //   }
  //   // case RecipeActionTypes.TotalNRecipesLoadError: {
  //   //   state = {
  //   //     ...state
  //   //   };
  //   //   break;
  //   // }
  // }
  return state;
}

import { recipeTotalNReducer } from './recipe.reducer';
import { EntityCollection, EntityActionFactory, EntityOp } from 'ngrx-data';
import { Recipe } from '@recipe-app-ngrx/models';
import { RecipeEntityOp } from './recipe.actions';

describe('recipeTotalNReducer', () => {
  const recipeCollection: EntityCollection<Recipe> = {
    entityName: 'Recipe',
    ids: [],
    entities: {},
    filter: undefined,
    loaded: false,
    loading: false,
    changeState: {},
    ...{totalNRecipes: 1000}
  }

  beforeEach(() => {
   
  });

  describe('valid Recipe actions ', () => {
    it('should return state with defined total number of recipes', () => {
      const data = 10;
      const entityActionFactory = new EntityActionFactory();
      const action = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_SUCCESS as unknown as EntityOp, data, {tag: 'API'});
      const result: EntityCollection<Recipe> = recipeTotalNReducer(recipeCollection, action);

      expect(result.entityName).toBe('Recipe');
      expect(result.loaded).toBe(false);
      expect(result.loading).toBe(false);
      expect(result.ids.length).toBe(0);
      expect(result.loaded).toBe(false);
      expect(result['totalNRecipes']).toBe(data);
    });

    it('should return state with initial total number of recipes', () => {
      const entityActionFactory = new EntityActionFactory();
      const action = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_ERROR as unknown as EntityOp, {}, {tag: 'API'});
      const result: EntityCollection<Recipe> = recipeTotalNReducer(recipeCollection, action);

      expect(result.entityName).toBe('Recipe');
      expect(result.loaded).toBe(false);
      expect(result.loading).toBe(false);
      expect(result.ids.length).toBe(0);
      expect(result.loaded).toBe(false);
      expect(result['totalNRecipes']).toBe(recipeCollection['totalNRecipes']);
    });
  });

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {
        payload: {
          entityOp: 'ngrx-data/'
        }
      } as any;
      const result = recipeTotalNReducer(recipeCollection, action);

      expect(result).toBe(recipeCollection);
    });
  });
});

import { recipeReducer } from './recipe.reducer';
import { EntityCollection, EntityActionFactory, EntityOp } from 'ngrx-data';
import { Recipe, RecipeFilters } from '@recipe-app-ngrx/models';
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
    ...{totalNRecipes: 1000, countFilteredRecipes: 0, filters: {category: '', username: '', page: 1, itemsPerPage: 5}}
  }

  beforeEach(() => {
   
  });

  describe('valid Recipe actions ', () => {
    it('should return state with defined total number of recipes', () => {
      const data = 10;
      const entityActionFactory = new EntityActionFactory();
      const action = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_SUCCESS as unknown as EntityOp, data, {tag: 'API'});
      const result: EntityCollection<Recipe> = recipeReducer(recipeCollection, action);

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
      const result: EntityCollection<Recipe> = recipeReducer(recipeCollection, action);

      expect(result.entityName).toBe('Recipe');
      expect(result.loaded).toBe(false);
      expect(result.loading).toBe(false);
      expect(result.ids.length).toBe(0);
      expect(result.loaded).toBe(false);
      expect(result['totalNRecipes']).toBe(recipeCollection['totalNRecipes']);
    });

    it(`should set prop 'loading' to true; QUERY_COUNT_FILTERED_RECIPES`, () => {
      const entityActionFactory = new EntityActionFactory();
      const action = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown as EntityOp, null, {tag: 'API'});
      const result: EntityCollection<Recipe> = recipeReducer(recipeCollection, action);

      expect(result.loading).toBeTruthy('true');
    });
    
    it(`should return state with defined value of 'countFilteredRecipes'; QUERY_COUNT_FILTERED_RECIPES_SUCCESS`, () => {
      const data = 100;
      const entityActionFactory = new EntityActionFactory();
      const action = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_SUCCESS as unknown as EntityOp, data, {tag: 'API'});
      const result: EntityCollection<Recipe> = recipeReducer(recipeCollection, action);

      expect(result['countFilteredRecipes']).toBe(data, data);
      expect(result.loading).toBeFalsy('false');
    });

    it(`should return state with defined value of 'countFilteredRecipes'; QUERY_COUNT_FILTERED_RECIPES_ERROR`, () => {
      const data = 101;
      const entityActionFactory = new EntityActionFactory();
      const action = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_ERROR as unknown as EntityOp, data, {tag: 'API'});
      const result: EntityCollection<Recipe> = recipeReducer(recipeCollection, action);

      expect(result.loading).toBeFalsy('false');
      expect(result['countFilteredRecipes']).toBe(recipeCollection.ids.length, recipeCollection.ids.length);
    });

    it(`should return the state with new 'filters'; FILTERS_UPDATED`, () => {
      const filters: RecipeFilters = {
        category: 'Bread',
        username: 'user_x',
        page: 10,
        itemsPerPage: 6
      };

      const entityActionFactory = new EntityActionFactory();
      const action = entityActionFactory.create('Recipe', RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, {tag: 'test'});
      const result: EntityCollection<Recipe> = recipeReducer(recipeCollection, action);

      expect(result['filters']['category']).toBe(filters.category, filters.category);
      expect(result['filters']['username']).toBe(filters.username, filters.username);
      expect(result['filters']['page']).toBe(filters.page, filters.page);
      expect(result['filters']['itemsPerPage']).toBe(filters.itemsPerPage, filters.itemsPerPage);
    });
  });

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {
        payload: {
          entityOp: 'ngrx-data/'
        }
      } as any;
      const result = recipeReducer(recipeCollection, action);

      expect(result).toBe(recipeCollection);
    });
  });
});

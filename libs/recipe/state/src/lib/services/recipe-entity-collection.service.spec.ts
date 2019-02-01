import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NgModule, Injectable } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, throwError, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { readFirst, hot, cold, getTestScheduler } from '@nrwl/nx/testing';
import { NxModule } from '@nrwl/nx';
import { NgrxDataModule, EntityServices, ENTITY_METADATA_TOKEN, DefaultDataService, HttpUrlGenerator, Logger, EntityDataService, EntityServicesBase, EntityServicesElements, EntityCollectionReducerRegistry, EntityOp, ENTITY_COLLECTION_META_REDUCERS } from 'ngrx-data';

import { RecipeEntityCollectionService } from './recipe-entity-collection.service';
import { recipeEntityMetadata } from '../recipe-entity-metadata';
import { Recipe, RecipeFilters } from '@recipe-app-ngrx/models';
import { TemporaryIdGenerator, LogService, ENV_RCP } from '@recipe-app-ngrx/utils';
import { RecipeEntityOp } from '../+state/recipe.actions';
import { recipeReducer, recipeMetaReducer } from '../+state/recipe.reducer';


describe('RecipeEntityCollectionService', () => {
  const recipe: Recipe = {
    id: 0,
    title: 'Recipe 1',
    title_slugged: 'recipe-1',
    description: 'Tasty recipe',
    ingredients: [],
    steps: [],
    images: [],
    footnotes: 'string',
    nutritionFat: 'string',
    preparetionTime: 12,
    cookTime: 12,
    servingsNumber: 6,

    category: 'dessert',
    user_username: 'rcp_user',
    date_created: new Date(),
  };
  let getAddSpy: jasmine.Spy;
  let recipeEntityCollectionService: RecipeEntityCollectionService;
  let entityCollectionReducerRegistry: EntityCollectionReducerRegistry;
  let getHttpPostSpy: jasmine.Spy;
  let getHttpGetSpy: jasmine.Spy;
  let filters: RecipeFilters;

  beforeEach(() => {
    const recipeDataServiceSpy = jasmine.createSpyObj('RecipeDataService', ['add']);
    getAddSpy = recipeDataServiceSpy.add;
    const httpSpy = jasmine.createSpyObj('HttpClient', ['post', 'get']);
    getHttpPostSpy = httpSpy.post;
    getHttpGetSpy = httpSpy.get;

    @NgModule({
      imports: [],
      providers: [
        { provide: ENTITY_METADATA_TOKEN, multi: true, useValue: recipeEntityMetadata },
        // { provide: RecipeDataService, useValue: recipeDataServiceSpy }
        RecipeDataService,
        EntityCollectionReducerRegistry
      ]
    })
    class CustomFeatureModule {
      constructor(
        entityDataService: EntityDataService,
        recipeDataService: RecipeDataService,
      ) {
        entityDataService.registerService('Recipe', recipeDataService);
      }
    }

    @NgModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        NgrxDataModule.forRoot({
          entityMetadata: {}
        }),
        CustomFeatureModule
      ],
      // providers: [ RecipeEntityCollectionService ]
      providers: [
        AppEntityServices,
        { provide: EntityServices, useExisting: AppEntityServices },
        { provide: ENTITY_COLLECTION_META_REDUCERS, useValue: [recipeMetaReducer] }
      ]
    })
    class RootModule {}

    TestBed.configureTestingModule({
      imports: [
        RootModule,
        // HttpClientModule
      ], 
      providers: [
        TemporaryIdGenerator,
        { provide: HttpClient, useValue: httpSpy },
        { provide: ENV_RCP, useValue: { production: false } },
        LogService
      ]
    });

    recipeEntityCollectionService = TestBed.get(RecipeEntityCollectionService);
    entityCollectionReducerRegistry = TestBed.get(EntityCollectionReducerRegistry);
  });

  it('should be created', () => {
    expect(recipeEntityCollectionService).toBeTruthy();
  });
  
  describe(`method add()`, () => {
    it('should add the recipe to Persistant state and to the remote server; SUCCESS', async done => {
      try {
        
        const newRecipe = {...recipe, id: 100000};
        getHttpPostSpy.and.returnValue(of(newRecipe)); 
        // method http.get() should be called for the selector selectors$.totalNRecipes$ 
        getHttpGetSpy.and.returnValue(of(1000)); 
  
        const addedRecipe$ = recipeEntityCollectionService.add(recipe).pipe(
          catchError(recipee => {
            return of(recipee);
          })
        )
        // .subscribe(
        //   data => { 
        //     console.log(data);
        //   }
        // );
   
        const addedRecipe = await readFirst(addedRecipe$);
        const entities = await readFirst(recipeEntityCollectionService.entities$);
        
        // doesn't return recipe in the case of success, however internal code returns 'of(recipe)` where recipe is the respond from the server;
        // and after that something get broken. Maybe something wrong with my code. However the error case works fine.
        expect(addedRecipe.title).toBe(recipe.title, recipe.title);
        expect(entities.length).toBe(1);
        // expect(entities[0].id).toBeGreaterThan(recipe.id, `${entities[0].id} > ${recipe.id}`);
        // expect(entities[0].id).toBe(addedRecipe.requestData.data.id, `error data: ${entities[0].id} == ${addedRecipe.requestData.data.id}`);
       
        done()
      } catch (err) {
        done.fail(err);
      }
    });
  
    it('should add the recipe to Persistant state and notify about the error on the server; ERROR', async done => {
      try {
        getHttpPostSpy.and.returnValue(throwError(new Error('err')));
        // method http.get() should be called for the selector selectors$.totalNRecipes$ 
        getHttpGetSpy.and.returnValue(of(1000)); 
        
        const addedRecipe$ = recipeEntityCollectionService.add(recipe).pipe(
          catchError(recipee => {
            return of(recipee);
          })
        )
   
        const error = await readFirst(addedRecipe$);
        const entities = await readFirst(recipeEntityCollectionService.entities$);
        
        expect(error.message).toBe('err');
        expect(error.requestData.data.title).toBe(recipe.title, recipe.title);
        expect(entities.length).toBe(1);
        expect(entities[0].id).toBeGreaterThan(recipe.id, `${entities[0].id} > ${recipe.id}`);
        expect(entities[0].id).toBe(error.requestData.data.id, `error data: ${entities[0].id} == ${error.requestData.data.id}`);
       
        done()
      } catch (err) {
        done.fail(err);
      }
    });
  });

  describe(`method 'loadTotalNRecipes()'`, () => {
    it(`method 'loadTotalNRecipes' should dispatch the action with 'entityOp=RecipeEntityOp.QUERY_TOTAL_N_RECIPES`, () => {
      const dispatchSpy = spyOn(recipeEntityCollectionService, 'createAndDispatch').and.callThrough();
      const tag = 'Create Recipe Page';
      recipeEntityCollectionService.loadTotalNRecipes(tag);
  
      expect(dispatchSpy).toHaveBeenCalledWith(RecipeEntityOp.QUERY_TOTAL_N_RECIPES as unknown as EntityOp, null, { tag: tag});
  
    });
  });

  describe(`method 'loadCountFilteredRecipes()'`, () => {
    it(`method 'loadCountFilteredRecipes' should dispatch the action with 'entityOp=RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES`, () => {
      const dispatchSpy = spyOn(recipeEntityCollectionService, 'createAndDispatch').and.callThrough();
      const tag = 'Recipe List Page';
      filters = { 
        category: 'Bread',
        username: '',
        page: 1,
        itemsPerPage: 6
      };
  
      recipeEntityCollectionService.loadCountFilteredRecipes(tag, filters);
      expect(dispatchSpy).toHaveBeenCalledWith(RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES as unknown as EntityOp, filters, { tag: tag});
  
    });
  });

  describe(`method 'belongToCategory()'`, () => {
    it(`should return 'true' when category of the recipe is single string`, () => {
      const belognsToCategory = recipeEntityCollectionService.belongToCategory('dessert', recipe);
      expect(belognsToCategory).toBeTruthy('true');
    });

    it(`should return 'false' when category of the recipe is single string`, () => {
      const belognsToCategory = recipeEntityCollectionService.belongToCategory('salad', recipe);
      expect(belognsToCategory).toBeFalsy('false');
    });

    it(`should return 'true' when category of the recipe is string[]`, () => {
      const anotherRecipe: Recipe = { ...recipe };
      anotherRecipe.category = ['dessert', 'cookie'];
      const belognsToCategory = recipeEntityCollectionService.belongToCategory('dessert', recipe);
      expect(belognsToCategory).toBeTruthy('true');
    });

    it(`should return 'true' when category of the recipe is string[]`, () => {
      const anotherRecipe: Recipe = { ...recipe };
      anotherRecipe.category = ['dessert', 'cookie'];
      const belognsToCategory = recipeEntityCollectionService.belongToCategory('salad', recipe);
      expect(belognsToCategory).toBeFalsy('false');
    });
  });

  describe(`method 'belongToUser()'`, () => {
    it(`should return 'true'`, () => {
      const belognsToUser = recipeEntityCollectionService.belongToUser('rcp_user', recipe);
      expect(belognsToUser).toBeTruthy('true');
    });

    it(`should return 'false'`, () => {
      const belognsToUser = recipeEntityCollectionService.belongToUser('user', recipe);
      expect(belognsToUser).toBeFalsy('false');
    });
  });

  describe(`filteredEntitiesByCategory$`, () => {
    it('should return entities filtered by \'dessert\'', () => {
      filters = { 
        category: 'dessert',
        username: null,
        page: 1,
        itemsPerPage: 6
      };
      const recipes: Recipe[] = [recipe, {...recipe, id: 1, category: 'salad'}];
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      
      // 2 lines below are useless
      // recipeEntityCollectionService.selectors$['filters$'] = hot('-a---', {a: filters});
      // recipeEntityCollectionService.entities$ = hot('-b---', { b: recipes});
     
      const expected = cold('c', { c: [filters, [recipes[0]]] });
      expect(recipeEntityCollectionService.filteredEntitiesByCategory$).toBeObservable(expected);
    });

    it('should return entities filtered by Category \'all\'', () => {
      filters = { 
        category: 'all',
        username: null,
        page: 1,
        itemsPerPage: 6
      };
      const recipes: Recipe[] = [recipe, {...recipe, id: 1, category: 'salad'}];
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      
      // 2 lines below are useless
      // recipeEntityCollectionService.selectors$['filters$'] = hot('-a---', {a: filters});
      // recipeEntityCollectionService.entities$ = hot('-b---', { b: recipes});
     
      const expected = cold('c', { c: [filters, recipes] });
      expect(recipeEntityCollectionService.filteredEntitiesByCategory$).toBeObservable(expected);
    });

    it('should add filters to the collection', () => {
      filters = { 
        category: 'dessert',
        username: null,
        page: 1,
        itemsPerPage: 6
      };
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });

      const expected = cold('a', {a: filters});
      expect(recipeEntityCollectionService.selectors$['filters$']).toBeObservable(expected);
    });
  });

  describe(`filteredEntitiesByUser$`, () => {
    it('should return entities filtered by username', () => {
      filters = { 
        category: null,
        username: 'test_user',
        page: 1,
        itemsPerPage: 6
      };
      const recipes: Recipe[] = [recipe, {...recipe, id: 1, user_username: 'test_user'}];
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      
      const expected = cold('c', { c: [filters, [recipes[1]]] });
      expect(recipeEntityCollectionService.filteredEntitiesByUser$).toBeObservable(expected);
    });
  });

  describe(`filteredEntitiesByCategoryAndUser$`, () => {
    it(`should return entities filtered by category='salad' and username='test_user'`, () => {
      filters = { 
        category: 'salad',
        username: 'test_user',
        page: 1,
        itemsPerPage: 6
      };
      const recipes: Recipe[] = [recipe, {...recipe, id: 1, user_username: 'test_user', category: 'salad'}];
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      
      const expected = cold('c', { c: [filters, [recipes[1]]] });
      expect(recipeEntityCollectionService.filteredEntitiesByCategoryAndUser$).toBeObservable(expected);
    });

    it(`should return entities filtered by category='all' and username='test_user'`, () => {
      filters = { 
        category: 'all',
        username: 'test_user',
        page: 1,
        itemsPerPage: 6
      };
      const recipes: Recipe[] = [recipe, {...recipe, id: 1, user_username: 'test_user', category: 'salad'}];
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      
      const expected = cold('c', { c: [filters, [recipes[1]]] });
      expect(recipeEntityCollectionService.filteredEntitiesByCategoryAndUser$).toBeObservable(expected);
    });
  });

  describe(`filteredEntitiesByAllFilters$`, () => {
    it(`should return entities filtered by category, page and itemsPerPage`, () => {
      filters = { 
        category: 'salad',
        username: null,
        page: 0,
        itemsPerPage: 2
      };
      const recipes: Recipe[] = [
        recipe,
        {...recipe, id: 1, category: 'salad', date_created: new Date(2)},
        {...recipe, id: 2, category: 'salad', date_created: new Date(4)},
        {...recipe, id: 3, category: 'salad', date_created: new Date(5)}
      ];

      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      
      const expected = cold('a', { a: [recipes[3], recipes[2]] });
      expect(recipeEntityCollectionService.filteredEntitiesByAllFilters$).toBeObservable(expected);
    });

    it(`should return entities filtered by user, page and itemsPerPage`, () => {
      filters = { 
        category: null,
        username: 'test_user',
        page: 0,
        itemsPerPage: 2
      };
      const recipes: Recipe[] = [
        recipe,
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
        {...recipe, id: 2, category: 'salad', user_username: '_user', date_created: new Date(4)},
        {...recipe, id: 3, category: 'salad', user_username: 'test_user', date_created: new Date(5)}
      ];

      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      
      const expected = cold('a', { a: [recipes[3], recipes[1]] });
      expect(recipeEntityCollectionService.filteredEntitiesByAllFilters$).toBeObservable(expected);
    });

    it(`should return entities filtered by user, page and itemsPerPage; number of recipes is less than 'itemsPerPage'`, () => {
      filters = { 
        category: null,
        username: 'test_user',
        page: 0,
        itemsPerPage: 2
      };
      const recipes: Recipe[] = [
        recipe,
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
        {...recipe, id: 2, category: 'salad', user_username: '_user', date_created: new Date(4)},
        {...recipe, id: 3, category: 'salad', user_username: 'te_user', date_created: new Date(5)}
      ];

      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      
      const expected = cold('a', { a: [recipes[1]] });
      expect(recipeEntityCollectionService.filteredEntitiesByAllFilters$).toBeObservable(expected);
    });

    it(`should return entities filtered by category, user, page and itemsPerPage`, () => {
      filters = { 
        category: 'salad',
        username: 'test_user',
        page: 0,
        itemsPerPage: 2
      };
      const recipes: Recipe[] = [
        recipe,
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
        {...recipe, id: 2, category: 'salad', user_username: 'test_user', date_created: new Date(4)},
        {...recipe, id: 3, category: 'salad', user_username: 'te_user', date_created: new Date(5)}
      ];

      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'API' });
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      
      const expected = cold('a', { a: [recipes[2], recipes[1]] });
      expect(recipeEntityCollectionService.filteredEntitiesByAllFilters$).toBeObservable(expected);
    });
  });

  describe(`loadRecipesByFilters()`, () => {
    it(`should load Recipes from the server; entities = []; Category case`, () => {
      filters = { 
        category: 'salad',
        username: null,
        page: 0,
        itemsPerPage: 2
      };
      const recipes: Recipe[] = [
        // recipe,
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
        {...recipe, id: 2, category: 'salad', user_username: 'test_user', date_created: new Date(4)},
        // {...recipe, id: 3, category: 'salad', user_username: 'te_user', date_created: new Date(5)}
      ];
      
      getHttpGetSpy.and.returnValue(of(recipes));
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'TEST' });
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_SUCCESS as unknown as EntityOp, 100, { tag: 'TEST' });
      // recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      recipeEntityCollectionService.loadRecipesByFilters();

      // recipes are sorted by time from newest to oldiest
      const expected = cold('a', { a: [recipes[1], recipes[0]] });
      expect(recipeEntityCollectionService.filteredRecipes$).toBeObservable(expected);
    });

    it(`should load Recipes from the EntityCache; prop 'entities' contains 4 recipes; Category case`, () => {
      filters = { 
        category: 'salad',
        username: null,
        page: 0,
        itemsPerPage: 2
      };
      const recipes: Recipe[] = [
        recipe,
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
        {...recipe, id: 2, category: 'salad', user_username: 'test_user', date_created: new Date(4)},
        {...recipe, id: 3, category: 'salad', user_username: 'te_user', date_created: new Date(5)}
      ];
      
      // getHttpGetSpy.and.returnValue(of(recipes));
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'TEST' });
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'TEST' });
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_SUCCESS as unknown as EntityOp, 100, { tag: 'TEST' });
      recipeEntityCollectionService.loadRecipesByFilters();
      
      // recipes are sorted by time from newest to oldiest
      /* Therefore entities = [
        {...recipe, id: 3, category: 'salad', user_username: 'te_user', date_created: new Date(5)}
        {...recipe, id: 2, category: 'salad', user_username: 'test_user', date_created: new Date(4)},
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
        ] 
      */
      const expected = cold('a', { a: [recipes[3], recipes[2]] });
      expect(recipeEntityCollectionService.filteredRecipes$).toBeObservable(expected);
    });

    it(`should load Recipes from the server; prop 'entities' contains 1 needed recipe; Category case`, () => {
      filters = { 
        category: 'salad',
        username: null,
        page: 0,
        itemsPerPage: 2
      };
      const recipes: Recipe[] = [
        recipe,
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
      ];

      const response: Recipe[] = [
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
        {...recipe, id: 2, category: 'salad', user_username: 'te_user', date_created: new Date(5)}
      ]
      
      getHttpGetSpy.and.returnValue(of(response));
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'TEST' });
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'TEST' });
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_SUCCESS as unknown as EntityOp, 100, { tag: 'TEST' });
      recipeEntityCollectionService.loadRecipesByFilters();
      
      // recipes are sorted by time from newest to oldiest
      const expected = cold('a', { a: [response[1], response[0]] });
      expect(recipeEntityCollectionService.filteredRecipes$).toBeObservable(expected);
    });

    it(`should load Recipes from the server; entities = []; Category and Username case`, () => {
      filters = { 
        category: 'salad',
        username: 'test_user',
        page: 0,
        itemsPerPage: 2
      };
      const recipes: Recipe[] = [
        // recipe,
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
        {...recipe, id: 2, category: 'salad', user_username: 'test_user', date_created: new Date(4)},
        // {...recipe, id: 3, category: 'salad', user_username: 'te_user', date_created: new Date(5)}
      ];
      
      getHttpGetSpy.and.returnValue(of(recipes));
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'TEST' });
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_SUCCESS as unknown as EntityOp, 100, { tag: 'TEST' });
      // recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'API' });
      recipeEntityCollectionService.loadRecipesByFilters();

      // recipes are sorted by time from newest to oldiest
      const expected = cold('a', { a: [recipes[1], recipes[0]] });
      expect(recipeEntityCollectionService.filteredRecipes$).toBeObservable(expected);
    });

    it(`should load Recipes from the server; prop 'entities' contains 1 needed recipe; Category and User case`, () => {
      filters = { 
        category: 'salad',
        username: 'test_user',
        page: 0,
        itemsPerPage: 2
      };
      const recipes: Recipe[] = [
        recipe,
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
      ];

      const response: Recipe[] = [
        {...recipe, id: 1, category: 'salad', user_username: 'test_user', date_created: new Date(2)},
        {...recipe, id: 2, category: 'salad', user_username: 'test_user', date_created: new Date(5)}
      ]
      
      getHttpGetSpy.and.returnValue(of(response));
      recipeEntityCollectionService.createAndDispatch(EntityOp.QUERY_ALL_SUCCESS, recipes, { tag: 'TEST' });
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.FILTERS_UPDATED as unknown as EntityOp, filters, { tag: 'TEST' });
      recipeEntityCollectionService.createAndDispatch(RecipeEntityOp.QUERY_COUNT_FILTERED_RECIPES_SUCCESS as unknown as EntityOp, 100, { tag: 'TEST' });
      recipeEntityCollectionService.loadRecipesByFilters();
      
      // recipes are sorted by time from newest to oldiest
      const expected = cold('a', { a: [response[1], response[0]] });
      expect(recipeEntityCollectionService.filteredRecipes$).toBeObservable(expected);
    });
  });
});

@Injectable()
class RecipeDataService extends DefaultDataService<Recipe> {
  constructor(http: HttpClient,httpUrlGenerator: HttpUrlGenerator, logger: Logger) {
    super('Recipe', http, httpUrlGenerator);
  }
}

@Injectable()
class AppEntityServices extends EntityServicesBase {
  constructor(
    entityServicesElements: EntityServicesElements,
    // Inject custom services, register them with the EntityServices, and expose in API.
    public readonly recipeEntityCollectionService: RecipeEntityCollectionService
  ) {
    super(entityServicesElements);
    this.registerEntityCollectionServices([recipeEntityCollectionService]);
  }

  // ... Additional convenience members
}

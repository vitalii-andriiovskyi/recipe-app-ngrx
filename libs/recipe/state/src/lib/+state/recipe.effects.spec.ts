import { TestBed, async } from '@angular/core/testing';

import { Observable, of } from 'rxjs';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { NxModule } from '@nrwl/nx';
import { hot, cold } from '@nrwl/nx/testing';

import { RecipeEffects } from './recipe.effects';
import { EntityActionFactory, EntityOp } from 'ngrx-data';
import { RecipeEntityOp } from './recipe.actions';
import { RecipeDataService } from '../services/recipe-data.service';

describe('RecipeEffects', () => {
  let actions$: Observable<any>;
  let effects: RecipeEffects;
  let entityActionFactory: EntityActionFactory;
  let getTotalNRecipesSpy: jasmine.Spy;

  beforeEach(() => {
    const recipeDataServiceSpy = jasmine.createSpyObj('RecipeDataService', ['getTotalNRecipes']);
    getTotalNRecipesSpy = recipeDataServiceSpy.getTotalNRecipes;

    TestBed.configureTestingModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])
      ],
      providers: [
        RecipeEffects,
        provideMockActions(() => actions$),
        EntityActionFactory,
        { provide: RecipeDataService, useValue: recipeDataServiceSpy }
      ]
    });

    effects = TestBed.get(RecipeEffects);
    entityActionFactory = TestBed.get(EntityActionFactory);

  });

  describe('totalNRecipes$', () => {
    it('should return SUCCESS action, when the server responds with a number ', () => {
      const action = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES as unknown as EntityOp);
      const completion = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_SUCCESS as unknown as EntityOp, 1000, {tag: 'API'});
      
      actions$ = hot('-a---', { a: action }); 
      const response = cold('-a|', { a: 1000 });
      const expected = cold('--b', { b: completion });

      getTotalNRecipesSpy.and.returnValue(response);
      expect(effects.totalNRecipes$).toBeObservable(expected);
    });

    it('should return ERROR action, when the server responds with an error ', () => {
      const action = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES as unknown as EntityOp);
      const completion = entityActionFactory.create('Recipe', RecipeEntityOp.QUERY_TOTAL_N_RECIPES_ERROR as unknown as EntityOp, null, {tag: 'API'});

      actions$ = hot('-a---', { a: action });
      const response = cold('-#', {}, { error: 'err' });
      const expected = cold('--b', { b: completion });

      getTotalNRecipesSpy.and.returnValue(response);
      expect(effects.totalNRecipes$).toBeObservable(expected);
    });
  });
});

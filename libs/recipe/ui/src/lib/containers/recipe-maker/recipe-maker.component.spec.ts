import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { RecipeMakerComponent } from './recipe-maker.component';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { User, Recipe } from '@recipe-app-ngrx/models';
import { RecipeEditorComponent } from '../../components/recipe-editor/recipe-editor.component';
import { Component, NgModule, DebugElement } from '@angular/core';
import { NxModule } from '@nrwl/nx';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgrxDataModule, EntityOp, EntityDataService, DataServiceError, RequestData } from 'ngrx-data';
import { RcpEntityStoreModule } from '@recipe-app-ngrx/rcp-entity-store';
import { TemporaryIdGenerator, ENV_RCP, LogService } from '@recipe-app-ngrx/utils';
import { HttpClient } from '@angular/common/http';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AuthFacade, AuthGuard } from '@recipe-app-ngrx/auth/state';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ParamMap, ActivatedRoute, convertToParamMap } from '@angular/router';
import { By } from '@angular/platform-browser';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { cold } from 'jasmine-marbles';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { delay } from 'rxjs/operators';

const recipe: Recipe = {
  id: 1001,
  title: 'Recipe 1',
  title_slugged: 'recipe-1',
  description: 'Tasty recipe',
  ingredients: [
    {
      id: 0,
      name: 'bread',
      quantity: 2,
      unit: 'kg'
    }
  ],
  steps: [ 'Step 1'],
  images: [],
  footnotes: 'Some info',
  nutritionFacts: '372 calories',
  preparationTime: 12,
  cookTime: 12,
  servingsNumber: 6,

  category: 'desserts',
  user_username: 'test_user',
  date_created: new Date(),
};

describe('RecipeMakerComponent', () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let deRcpMakerComponent: DebugElement;
  let rcpMakerComponent: RecipeMakerComponent;

  const loggedIn$ = new BehaviorSubject<boolean>(false);
  const authencticatedUser$ = new BehaviorSubject<User>(null);
  const activatedRouteParamMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));
  const activatedRoute = {
    paramMap: activatedRouteParamMap$.asObservable()
  };

  let loginRedirectSpy: jasmine.Spy;
  let getHttpPostSpy: jasmine.Spy;
  let getHttpGetSpy: jasmine.Spy;

  let router: Router;
  let recipeEntityCollectionService: RecipeEntityCollectionService;
  let recipeDataService: any;
  let entityDataService: EntityDataService;
  let loadTotalNSpy: jasmine.Spy;
  let getByIdSpy: jasmine.Spy;

  const user = {
    _id: '',
    username: 'test_name',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  } as User;

  beforeEach(async(() => {
    const authFacadeSpy = jasmine.createSpyObj('AuthFacade', ['loginRedirect']);
    authFacadeSpy.loggedIn$ = loggedIn$.asObservable();
    authFacadeSpy.authencticatedUser$ = authencticatedUser$.asObservable();
    loginRedirectSpy = authFacadeSpy.loginRedirect;

    const httpSpy = jasmine.createSpyObj('HttpClient', ['post', 'get']);
    getHttpPostSpy = httpSpy.post;
    getHttpGetSpy = httpSpy.get;

    @NgModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        // StoreRouterConnectingModule.forRoot(),
        RcpEntityStoreModule,
      ],
    })
    class RootModule {}
 
    TestBed.configureTestingModule({
      imports: [ 
        RootModule,
        SharedComponentsModule,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([
          { path: 'create-recipe', component: RecipeMakerComponent, canActivate: [ AuthGuard ] },
          { path: 'edit-recipe/:id', component: RecipeMakerComponent, canActivate: [ AuthGuard ] },
          { path: '**', component: PageNotFoundComponent }
        ])
      ],
      declarations: [RecipeMakerComponent, RecipeEditorComponent, PageNotFoundComponent, TestComponent ],
      providers: [
        AuthGuard,
        TemporaryIdGenerator,
        { provide: AuthFacade, useValue: authFacadeSpy },
        { provide: HttpClient, useValue: httpSpy },
        { provide: ENV_RCP, useValue: { production: false } },
        { provide: ActivatedRoute, useValue: activatedRoute },
        LogService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
    deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));

    entityDataService = TestBed.get(EntityDataService);
    recipeDataService = entityDataService.getService('Recipe');
    loadTotalNSpy = spyOn(recipeDataService, 'getTotalNRecipes');
    getByIdSpy = spyOn(recipeDataService, 'getById');
  });

  describe(`loggedIn='false'; user isn't authenticated`, () => {
    it(`shouldn't create RecipeMakerComponent; route='/create-recipe'`, fakeAsync(() => {
      const path = '/create-recipe';
      expect(deRcpMakerComponent).toBeFalsy(`there's no the RecipeMakerComponent`);
      router.navigate([path]);
      tick();

      fixture.detectChanges();
      deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
      expect(deRcpMakerComponent).toBeFalsy(`there's no the RecipeMakerComponent`);
    }));

    it(`shouldn't create RecipeMakerComponent; route='/edit-recipe/100'`, fakeAsync(() => {
      const path = '/edit-recipe/100';
      expect(deRcpMakerComponent).toBeFalsy(`there's no the RecipeMakerComponent`);
      router.navigate([path]);
      tick();

      fixture.detectChanges();
      deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
      expect(deRcpMakerComponent).toBeFalsy(`there's no the RecipeMakerComponent`);
    }));
  });


  describe(`loggedIn='true'; user is authenticated`, () => {
    beforeEach(async(() => {
      loggedIn$.next(true);
      authencticatedUser$.next(user);
    }));

    describe(`route='/create-recipe'`, () => {
      const path = '/create-recipe';

      beforeEach(async(() => {
        // navigate to RecipeMakerComponent
        router.navigate([path]);
        // pass data to ActivatedRoute.paramMap
        activatedRouteParamMap$.next(convertToParamMap({}));
        // intercept the call to server; route '/api/recipes/totalN'
        loadTotalNSpy.and.returnValue(of(2));
        // getHttpGetSpy.and.returnValue(of(2));
      }));

      it(`component should be created`, () => {
        fixture.detectChanges();

        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        expect(deRcpMakerComponent).toBeTruthy('is created');
      });

      it(`nonRecipe$ and recipe$ pass null`, () => {
        fixture.detectChanges();

        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        rcpMakerComponent = deRcpMakerComponent.componentInstance;

        const expected = cold('a', { a: null });
        expect(rcpMakerComponent.nonRecipe$).toBeObservable(expected);
        expect(rcpMakerComponent.recipe$).toBeObservable(expected);
      });
 
      it(`loading$ pass false`, fakeAsync(() => {
        fixture.detectChanges();

        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        rcpMakerComponent = deRcpMakerComponent.componentInstance;
        rcpMakerComponent.loading$.subscribe(val => {
          expect(val).toBeFalsy('loading$ passes false');
        });

        tick(1000);
      }));

      it(`RecipeEditorComponent is created; .error and mat-spinner aren't created`, () => {
        fixture.detectChanges();

        const rcpEditorComp = fixture.debugElement.query(By.css('rcp-recipe-editor'));
        expect(rcpEditorComp).toBeTruthy('RecipeEditorComponent is created');
        const errorContainer = fixture.debugElement.query(By.css('.error'));
        expect(errorContainer).toBeFalsy('.error isn\'t created');
        const matSpinner = fixture.debugElement.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeFalsy('.mat-spinner isn\'t created');
      });

    })

    describe(`route='/edit-recipe/:id'; recipe is in persistant state`, () => {
      const path = '/edit-recipe/1001';

      beforeEach(async(() => {
        recipeEntityCollectionService = TestBed.get(RecipeEntityCollectionService);
        recipeEntityCollectionService.createAndDispatch(EntityOp.ADD_ONE, recipe);
        // navigate to RecipeMakerComponent
        router.navigate([path]);
        // intercept the call to server; route '/api/recipes/totalN'
        loadTotalNSpy.and.returnValue(of(2));
        // getHttpGetSpy.and.returnValue(of(2));
      }));

      it(`component should be created`, () => {
        fixture.detectChanges();

        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        expect(deRcpMakerComponent).toBeTruthy('is created');
      });

      it(`recipeById$ and recipe$ pass 'recipe'`, () => {
        fixture.detectChanges();

        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        rcpMakerComponent = deRcpMakerComponent.componentInstance;

        const expected = cold('a', { a: recipe });
        expect(rcpMakerComponent.recipeById$).toBeObservable(expected);
        expect(rcpMakerComponent.recipe$).toBeObservable(expected);
      });

      it(`loading$ pass false`, fakeAsync(() => {
        fixture.detectChanges();

        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        rcpMakerComponent = deRcpMakerComponent.componentInstance;
        rcpMakerComponent.loading$.subscribe(val => {
          expect(val).toBeFalsy('loading$ passes false');
        });

        tick(1000);
      }));

      it(`RecipeEditorComponent is created; .error and mat-spinner aren't created`, () => {
        fixture.detectChanges();

        const rcpEditorComp = fixture.debugElement.query(By.css('rcp-recipe-editor'));
        expect(rcpEditorComp).toBeTruthy('RecipeEditorComponent is created');
        expect(rcpEditorComp.componentInstance.recipeForm.value.id).toBe(recipe.id, recipe.id);

        const errorContainer = fixture.debugElement.query(By.css('.error'));
        expect(errorContainer).toBeFalsy('.error isn\'t created');
        const matSpinner = fixture.debugElement.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeFalsy('.mat-spinner isn\'t created');
      });

    });

    describe(`route='/edit-recipe/:id'; recipe isn't in persistant state`, () => {
      const path = '/edit-recipe/1000';
      const recipe100: Recipe = { ...recipe, id: 1000 };

      beforeEach(async(() => {
        recipeEntityCollectionService = TestBed.get(RecipeEntityCollectionService);
        
      }));

      it(`component should be created`, fakeAsync(() => {
        // intercept the call to server; route '/api/recipes/totalN'
        loadTotalNSpy.and.returnValue(of(2));
        getByIdSpy.and.returnValue(of(recipe100).pipe(delay(1)) );
        // navigate to RecipeMakerComponent
        router.navigate([path]);
        
        tick();
        fixture.detectChanges();

        deRcpMakerComponent = fixture.debugElement.query(By.css('rcp-recipe-maker'));
        expect(deRcpMakerComponent).toBeTruthy('is created');
        tick(1200);

      }));

      it(`should load recipe from the server`, fakeAsync(() => {
        // intercept the call to server; route '/api/recipes/totalN'
        loadTotalNSpy.and.returnValue(of(2));
        getByIdSpy.and.returnValue(of(recipe100).pipe(delay(1000)) );
        // navigate to RecipeMakerComponent
        router.navigate([path]);
        
        tick(1);
        fixture.detectChanges();
        tick(1);
        fixture.detectChanges();

        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        let matSpinner = deRcpMakerComponent.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeTruthy('mat-spinner shows loading');
        let error = deRcpMakerComponent.query(By.css('.error'));
        expect(error).toBeFalsy(`there's no .error Element`);
        let rcpEditorComp = deRcpMakerComponent.query(By.css('rcp-recipe-editor'));
        expect(rcpEditorComp).toBeFalsy('RecipeEditorComponent isn\'t created');

        tick(1001);
        fixture.detectChanges();
        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        matSpinner = deRcpMakerComponent.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeFalsy('mat-spinner shows loading');
        

        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        rcpMakerComponent = deRcpMakerComponent.componentInstance;
        const expected = cold('a', { a: recipe100 });
        expect(rcpMakerComponent.recipe$).toBeObservable(expected);

        rcpEditorComp = fixture.debugElement.query(By.css('rcp-recipe-editor'));
        expect(rcpEditorComp).toBeTruthy('RecipeEditorComponent is created');
        expect(rcpEditorComp.componentInstance.recipeForm.value.id).toBe(recipe100.id, recipe100.id);

        error = deRcpMakerComponent.query(By.css('.error'));
        expect(error).toBeFalsy(`there's no .error Element`);

        tick(1200);
      }));

      it(`should show the error when can't load recipe from the server`, fakeAsync(() => {
        const reqData: RequestData = {
          method: 'GET',
          url: 'api/recipe/1000'
        }
        const err = new DataServiceError(new Error('error'), reqData);
        // intercept the call to server; route '/api/recipes/totalN'
        loadTotalNSpy.and.returnValue(of(2));
        getByIdSpy.and.returnValue(throwError(err).pipe(delay(1000)) );
        // navigate to RecipeMakerComponent
        router.navigate([path]);
        
        tick(1);
        fixture.detectChanges();
        tick(1);
        fixture.detectChanges();

        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        let matSpinner = deRcpMakerComponent.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeTruthy('mat-spinner shows loading');
        let error = deRcpMakerComponent.query(By.css('.error'));
        expect(error).toBeFalsy(`there's no .error Element`);
        let rcpEditorComp = deRcpMakerComponent.query(By.css('rcp-recipe-editor'));
        expect(rcpEditorComp).toBeFalsy('RecipeEditorComponent isn\'t created');

        tick(1001);
        fixture.detectChanges();
        
        deRcpMakerComponent =  fixture.debugElement.query(By.css('rcp-recipe-maker'));
        matSpinner = deRcpMakerComponent.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeFalsy('mat-spinner shows loading');

        rcpEditorComp = deRcpMakerComponent.query(By.css('rcp-recipe-editor'));
        expect(rcpEditorComp).toBeFalsy('RecipeEditorComponent isn\'t created');
        
        error = deRcpMakerComponent.query(By.css('.error'));
        expect(error).toBeTruthy(`there's no .error Element`);

        tick(1200);
      }));


    });
  });

});

@Component({
  template: `<div>Page not Found</div>`,
  selector: 'rcp-pnf'
})
class PageNotFoundComponent { }

@Component({
  selector: 'rcp-test',
  template: `<div>test component</div><router-outlet></router-outlet>`
})
class TestComponent { }


import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';

import { RecipeMakerComponent } from './recipe-maker.component';
import { BehaviorSubject, of, throwError, Observable } from 'rxjs';
import { User, Recipe } from '@recipe-app-ngrx/models';
import { RecipeEditorComponent } from '../../components/recipe-editor/recipe-editor.component';
import { Component, NgModule, DebugElement } from '@angular/core';
import { NxModule } from '@nrwl/angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  EntityOp,
  EntityDataService,
  DataServiceError,
  RequestData
} from '@ngrx/data';
import { RcpEntityStoreModule } from '@recipe-app-ngrx/rcp-entity-store';
import {
  TemporaryIdGenerator,
  ENV_RCP,
  LogService
} from '@recipe-app-ngrx/utils';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AuthFacade, AuthGuard } from '@recipe-app-ngrx/auth/state';
import { RouterTestingModule } from '@angular/router/testing';
import {
  Router,
  ParamMap,
  ActivatedRoute,
  convertToParamMap
} from '@angular/router';
import { By } from '@angular/platform-browser';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { cold } from 'jasmine-marbles';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { delay, map } from 'rxjs/operators';

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
  steps: ['Step 1'],
  images: [],
  footnotes: 'Some info',
  nutritionFacts: '372 calories',
  preparationTime: 12,
  cookTime: 12,
  servingsNumber: 6,

  category: { url: 'desserts' },
  user_username: 'test_user',
  date_created: new Date()
};

describe('RecipeMakerComponent', () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let deRcpMakerComponent: DebugElement;
  let rcpMakerComponent: RecipeMakerComponent;

  let deRcpEditorComponent: DebugElement;
  let rcpEditorComponent: RecipeEditorComponent;

  const loggedIn$ = new BehaviorSubject<boolean>(false);
  const authencticatedUser$ = new BehaviorSubject<User>(null);
  const activatedRouteParamMap$ = new BehaviorSubject<ParamMap>(
    convertToParamMap({})
  );
  const activatedRoute = {
    paramMap: activatedRouteParamMap$.asObservable()
  };

  let loginRedirectSpy: jasmine.Spy;
  let getHttpPostSpy: jasmine.Spy;
  let getHttpGetSpy: jasmine.Spy;
  let httpPutSpy: jasmine.Spy;

  let router: Router;
  let recipeEntityCollectionService: RecipeEntityCollectionService;
  let recipeDataService: any;
  let entityDataService: EntityDataService;
  let loadTotalNSpy: jasmine.Spy;
  let getByIdSpy: jasmine.Spy;

  const user = {
    _id: '',
    username: 'test_user',
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

    const httpSpy = jasmine.createSpyObj('HttpClient', ['post', 'get', 'put']);
    getHttpPostSpy = httpSpy.post;
    getHttpGetSpy = httpSpy.get;
    httpPutSpy = httpSpy.put;

    @NgModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        // StoreRouterConnectingModule.forRoot(),
        RcpEntityStoreModule
      ]
    })
    class RootModule {}

    TestBed.configureTestingModule({
      imports: [
        RootModule,
        SharedComponentsModule,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([
          {
            path: 'create-recipe',
            component: RecipeMakerComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'edit-recipe/:id',
            component: RecipeMakerComponent,
            canActivate: [AuthGuard]
          },
          { path: '**', component: PageNotFoundComponent }
        ])
      ],
      declarations: [
        RecipeMakerComponent,
        RecipeEditorComponent,
        PageNotFoundComponent,
        TestComponent
      ],
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
    deRcpMakerComponent = fixture.debugElement.query(
      By.css('rcp-recipe-maker')
    );

    entityDataService = TestBed.get(EntityDataService);
    recipeDataService = entityDataService.getService('Recipe');
    loadTotalNSpy = spyOn(recipeDataService, 'getTotalNRecipes');
    getByIdSpy = spyOn(recipeDataService, 'getById');
  });

  describe(`loggedIn='false'; user isn't authenticated`, () => {
    it(`shouldn't create RecipeMakerComponent; route='/create-recipe'`, fakeAsync(() => {
      const path = '/create-recipe';
      expect(deRcpMakerComponent).toBeFalsy(
        `there's no the RecipeMakerComponent`
      );
      router.navigate([path]);
      tick();

      fixture.detectChanges();
      deRcpMakerComponent = fixture.debugElement.query(
        By.css('rcp-recipe-maker')
      );
      expect(deRcpMakerComponent).toBeFalsy(
        `there's no the RecipeMakerComponent`
      );
    }));

    it(`shouldn't create RecipeMakerComponent; route='/edit-recipe/100'`, fakeAsync(() => {
      const path = '/edit-recipe/100';
      expect(deRcpMakerComponent).toBeFalsy(
        `there's no the RecipeMakerComponent`
      );
      router.navigate([path]);
      tick();

      fixture.detectChanges();
      deRcpMakerComponent = fixture.debugElement.query(
        By.css('rcp-recipe-maker')
      );
      expect(deRcpMakerComponent).toBeFalsy(
        `there's no the RecipeMakerComponent`
      );
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

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        expect(deRcpMakerComponent).toBeTruthy('is created');
      });

      it(`nonRecipe$ and recipe$ pass null`, () => {
        fixture.detectChanges();

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        rcpMakerComponent = deRcpMakerComponent.componentInstance;

        const expected = cold('a', { a: null });
        expect(rcpMakerComponent.nonRecipe$).toBeObservable(expected);
        expect(rcpMakerComponent.recipe$).toBeObservable(expected);
      });

      it(`loading$ pass false`, fakeAsync(() => {
        fixture.detectChanges();

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        rcpMakerComponent = deRcpMakerComponent.componentInstance;
        rcpMakerComponent.loading$.subscribe(val => {
          expect(val).toBeFalsy('loading$ passes false');
        });

        tick(1000);
      }));

      it(`RecipeEditorComponent is created; .error and mat-spinner aren't created`, () => {
        fixture.detectChanges();

        const rcpEditorComp = fixture.debugElement.query(
          By.css('rcp-recipe-editor')
        );
        expect(rcpEditorComp).toBeTruthy('RecipeEditorComponent is created');
        const errorContainer = fixture.debugElement.query(By.css('.error'));
        expect(errorContainer).toBeFalsy(".error isn't created");
        const matSpinner = fixture.debugElement.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeFalsy(".mat-spinner isn't created");
      });

      it('should create new recipe and succesfully save it on the server', fakeAsync(() => {
        const newRecipe = {
          ...recipe,
          id: 0,
          category: { value: 'Desserts', url: 'desserts' }
        };
        const recipeFormValue: any = { ...newRecipe };
        recipeFormValue.category = recipeFormValue.category.url;
        delete recipeFormValue.date_created;
        delete recipeFormValue.title_slugged;
        delete recipeFormValue.user_username;

        getHttpPostSpy.and.returnValue(of(newRecipe).pipe(delay(1000)));
        recipeEntityCollectionService = TestBed.get(
          RecipeEntityCollectionService
        );

        fixture.detectChanges();
        deRcpEditorComponent = fixture.debugElement.query(
          By.css('rcp-recipe-editor')
        );
        rcpEditorComponent = deRcpEditorComponent.componentInstance;
        rcpEditorComponent.createdRecipe.emit({
          addMode: true,
          recipe: recipeFormValue
        });

        const recipes: Recipe[] = [{ ...newRecipe, id: 2000 }];
        const expected = cold('a', { a: recipes });
        expect(recipeEntityCollectionService.entities$).toBeObservable(
          expected
        );
        let expectedLoading = cold('a', { a: true });
        expect(recipeEntityCollectionService.loading$).toBeObservable(
          expectedLoading
        );

        // fixture.detectChanges();
        // const snackBar = deRcpEditorComponent.nativeElement.closest('body').querySelector('.cdk-overlay .mat-snack-bar-container')
        // expect(snackBar).toBeTruthy('snackbar is shown');

        tick(1001);
        fixture.detectChanges();

        expectedLoading = cold('a', { a: false });
        expect(recipeEntityCollectionService.loading$).toBeObservable(
          expectedLoading
        );
        tick(10000);
      }));

      it('should create new recipe and cancel Persistant because of the error on the server', fakeAsync(() => {
        const error: HttpErrorResponse = new HttpErrorResponse({
          error: new Error('recipe is not saved'),
          status: 400,
          url: 'api/recipe/1001'
        });
        const newRecipe = {
          ...recipe,
          id: 0,
          category: { value: 'Desserts', url: 'desserts' }
        };
        const recipeFormValue: any = { ...newRecipe };

        recipeFormValue.category = recipeFormValue.category.url;
        delete recipeFormValue.date_created;
        delete recipeFormValue.title_slugged;
        delete recipeFormValue.user_username;

        getHttpPostSpy.and.returnValue(throwError(error).pipe(delay(1000)));
        recipeEntityCollectionService = TestBed.get(
          RecipeEntityCollectionService
        );

        fixture.detectChanges();
        deRcpEditorComponent = fixture.debugElement.query(
          By.css('rcp-recipe-editor')
        );
        rcpEditorComponent = deRcpEditorComponent.componentInstance;
        rcpEditorComponent.createdRecipe.emit({
          addMode: true,
          recipe: recipeFormValue
        });

        const recipes: Recipe[] = [{ ...newRecipe, id: 2000 }];
        const expected = cold('a', { a: recipes });
        expect(recipeEntityCollectionService.entities$).toBeObservable(
          expected
        );
        let expectedLoading = cold('a', { a: true });
        expect(recipeEntityCollectionService.loading$).toBeObservable(
          expectedLoading
        );

        // fixture.detectChanges();
        // const snackBar = deRcpEditorComponent.nativeElement.closest('body').querySelector('.cdk-overlay .mat-snack-bar-container')
        // expect(snackBar).toBeTruthy('snackbar is shown');

        tick(1001);
        fixture.detectChanges();

        expectedLoading = cold('a', { a: false });
        expect(recipeEntityCollectionService.loading$).toBeObservable(
          expectedLoading
        );
        tick(10000);
      }));
    });

    describe(`route='/edit-recipe/:id'; recipe is in persistant state`, () => {
      const path = '/edit-recipe/1001';

      beforeEach(async(() => {
        recipeEntityCollectionService = TestBed.get(
          RecipeEntityCollectionService
        );
        recipeEntityCollectionService.createAndDispatch(
          EntityOp.ADD_ONE,
          recipe
        );
        // navigate to RecipeMakerComponent
        router.navigate([path]);
        // intercept the call to server; route '/api/recipes/totalN'
        loadTotalNSpy.and.returnValue(of(1));
        // getHttpGetSpy.and.returnValue(of(2));
      }));

      it(`component should be created`, () => {
        fixture.detectChanges();

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        expect(deRcpMakerComponent).toBeTruthy('is created');
      });

      it(`recipeById$ and recipe$ pass 'recipe'`, () => {
        fixture.detectChanges();

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        rcpMakerComponent = deRcpMakerComponent.componentInstance;

        const expected = cold('a', { a: recipe });
        expect(rcpMakerComponent.recipeById$).toBeObservable(expected);
        expect(rcpMakerComponent.recipe$).toBeObservable(expected);
      });

      it(`loading$ pass false`, fakeAsync(() => {
        fixture.detectChanges();

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        rcpMakerComponent = deRcpMakerComponent.componentInstance;
        rcpMakerComponent.loading$.subscribe(val => {
          expect(val).toBeFalsy('loading$ passes false');
        });

        tick(1000);
      }));

      it(`RecipeEditorComponent is created; .error and mat-spinner aren't created`, () => {
        fixture.detectChanges();

        const rcpEditorComp = fixture.debugElement.query(
          By.css('rcp-recipe-editor')
        );
        expect(rcpEditorComp).toBeTruthy('RecipeEditorComponent is created');
        expect(rcpEditorComp.componentInstance.recipeForm.value.id).toBe(
          recipe.id,
          recipe.id
        );

        const errorContainer = fixture.debugElement.query(By.css('.error'));
        expect(errorContainer).toBeFalsy(".error isn't created");
        const matSpinner = fixture.debugElement.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeFalsy(".mat-spinner isn't created");
      });

      it('should update new recipe and succesfully save it on the server', fakeAsync(() => {
        const updatedRecipe: Recipe = {
          ...recipe,
          title: 'Another recipe',
          category: { value: 'Desserts', url: 'desserts' }
        };
        const recipeFormValue: any = { ...updatedRecipe };

        recipeFormValue.category = recipeFormValue.category.url;
        delete recipeFormValue.date_created;
        delete recipeFormValue.title_slugged;
        delete recipeFormValue.user_username;

        httpPutSpy.and.returnValue(of(updatedRecipe).pipe(delay(1000)));
        recipeEntityCollectionService = TestBed.get(
          RecipeEntityCollectionService
        );

        fixture.detectChanges();
        deRcpEditorComponent = fixture.debugElement.query(
          By.css('rcp-recipe-editor')
        );
        rcpEditorComponent = deRcpEditorComponent.componentInstance;
        rcpEditorComponent.createdRecipe.emit({
          addMode: false,
          recipe: recipeFormValue
        });

        // UpdatedRecipe still has `title_slugged=recipe-1`. RecipeMaker will rewrite it to right one, which is correct
        const recipes: Recipe[] = [
          { ...updatedRecipe, title_slugged: 'another-recipe' }
        ];
        const expected = cold('a', { a: recipes });
        expect(recipeEntityCollectionService.entities$).toBeObservable(
          expected
        );
        let expectedLoading = cold('a', { a: true });
        expect(recipeEntityCollectionService.loading$).toBeObservable(
          expectedLoading
        );

        // fixture.detectChanges();
        // const snackBar = deRcpEditorComponent.nativeElement.closest('body').querySelector('.cdk-overlay .mat-snack-bar-container')
        // expect(snackBar).toBeTruthy('snackbar is shown');

        tick(1001);
        fixture.detectChanges();

        expectedLoading = cold('a', { a: false });
        expect(recipeEntityCollectionService.loading$).toBeObservable(
          expectedLoading
        );
        tick(10000);
      }));

      it('should update new recipe and cancel Persistant because of the error on the server', fakeAsync(() => {
        const error: HttpErrorResponse = new HttpErrorResponse({
          error: new Error('recipe is not saved'),
          status: 400,
          url: 'api/recipe/1001'
        });
        const updatedRecipe: Recipe = {
          ...recipe,
          title: 'Another recipe',
          category: { value: 'Desserts', url: 'desserts' }
        };
        const recipeFormValue: any = { ...updatedRecipe };

        recipeFormValue.category = recipeFormValue.category.url;
        delete recipeFormValue.date_created;
        delete recipeFormValue.title_slugged;
        delete recipeFormValue.user_username;

        httpPutSpy.and.returnValue(throwError(error).pipe(delay(1000)));
        recipeEntityCollectionService = TestBed.get(
          RecipeEntityCollectionService
        );

        fixture.detectChanges();
        deRcpEditorComponent = fixture.debugElement.query(
          By.css('rcp-recipe-editor')
        );
        rcpEditorComponent = deRcpEditorComponent.componentInstance;
        rcpEditorComponent.createdRecipe.emit({
          addMode: false,
          recipe: recipeFormValue
        });

        // recipe should be saved in Persistant State
        // UpdatedRecipe still has `title_slugged=recipe-1`. RecipeMaker will rewrite it to right one, which is correct
        const recipes: Recipe[] = [
          { ...updatedRecipe, title_slugged: 'another-recipe' }
        ];
        const expected = cold('a', { a: recipes });
        // Can't compare dates. Dates are the same in comparing objects, however dates objects are different;
        expect(recipeEntityCollectionService.entities$).toBeObservable(
          expected
        );
        let expectedLoading = cold('a', { a: true });
        expect(recipeEntityCollectionService.loading$).toBeObservable(
          expectedLoading
        );

        // fixture.detectChanges();
        // const snackBar = deRcpEditorComponent.nativeElement.closest('body').querySelector('.cdk-overlay .mat-snack-bar-container')
        // expect(snackBar).toBeTruthy('snackbar is shown');

        tick(1001);
        fixture.detectChanges();

        expectedLoading = cold('a', { a: false });
        expect(recipeEntityCollectionService.loading$).toBeObservable(
          expectedLoading
        );
        tick(10000);
      }));
    });

    describe(`route='/edit-recipe/:id'; recipe isn't in persistant state`, () => {
      const path = '/edit-recipe/1000';
      const recipe100: Recipe = { ...recipe, id: 1000 };

      beforeEach(async(() => {
        recipeEntityCollectionService = TestBed.get(
          RecipeEntityCollectionService
        );
      }));

      it(`component should be created`, fakeAsync(() => {
        // intercept the call to server; route '/api/recipes/totalN'
        loadTotalNSpy.and.returnValue(of(2));
        getByIdSpy.and.returnValue(of(recipe100).pipe(delay(1)));
        // navigate to RecipeMakerComponent
        router.navigate([path]);

        tick();
        fixture.detectChanges();

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        expect(deRcpMakerComponent).toBeTruthy('is created');
        tick(1200);
      }));

      it(`should load recipe from the server`, fakeAsync(() => {
        // intercept the call to server; route '/api/recipes/totalN'
        loadTotalNSpy.and.returnValue(of(2));
        getByIdSpy.and.returnValue(of(recipe100).pipe(delay(1000)));
        // navigate to RecipeMakerComponent
        router.navigate([path]);

        tick(1);
        fixture.detectChanges();
        tick(1);
        fixture.detectChanges();

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        let matSpinner = deRcpMakerComponent.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeTruthy('mat-spinner shows loading');
        let error = deRcpMakerComponent.query(By.css('.error'));
        expect(error).toBeFalsy(`there's no .error Element`);
        let rcpEditorComp = deRcpMakerComponent.query(
          By.css('rcp-recipe-editor')
        );
        expect(rcpEditorComp).toBeFalsy("RecipeEditorComponent isn't created");

        tick(1001);
        fixture.detectChanges();
        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        matSpinner = deRcpMakerComponent.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeFalsy('mat-spinner shows loading');

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        rcpMakerComponent = deRcpMakerComponent.componentInstance;
        const expected = cold('a', { a: recipe100 });
        expect(rcpMakerComponent.recipe$).toBeObservable(expected);

        rcpEditorComp = fixture.debugElement.query(By.css('rcp-recipe-editor'));
        expect(rcpEditorComp).toBeTruthy('RecipeEditorComponent is created');
        expect(rcpEditorComp.componentInstance.recipeForm.value.id).toBe(
          recipe100.id,
          recipe100.id
        );

        error = deRcpMakerComponent.query(By.css('.error'));
        expect(error).toBeFalsy(`there's no .error Element`);

        tick(1200);
      }));

      it(`should show the error when can't load recipe from the server`, fakeAsync(() => {
        const reqData: RequestData = {
          method: 'GET',
          url: 'api/recipe/1000'
        };
        const err = new DataServiceError(new Error('error'), reqData);
        // intercept the call to server; route '/api/recipes/totalN'
        loadTotalNSpy.and.returnValue(of(2));
        getByIdSpy.and.returnValue(throwError(err).pipe(delay(1000)));
        // navigate to RecipeMakerComponent
        router.navigate([path]);

        tick(1);
        fixture.detectChanges();
        tick(1);
        fixture.detectChanges();

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        let matSpinner = deRcpMakerComponent.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeTruthy('mat-spinner shows loading');
        let error = deRcpMakerComponent.query(By.css('.error'));
        expect(error).toBeFalsy(`there's no .error Element`);
        let rcpEditorComp = deRcpMakerComponent.query(
          By.css('rcp-recipe-editor')
        );
        expect(rcpEditorComp).toBeFalsy("RecipeEditorComponent isn't created");

        tick(1001);
        fixture.detectChanges();

        deRcpMakerComponent = fixture.debugElement.query(
          By.css('rcp-recipe-maker')
        );
        matSpinner = deRcpMakerComponent.query(By.css('.mat-spinner'));
        expect(matSpinner).toBeFalsy('mat-spinner shows loading');

        rcpEditorComp = deRcpMakerComponent.query(By.css('rcp-recipe-editor'));
        expect(rcpEditorComp).toBeFalsy("RecipeEditorComponent isn't created");

        error = deRcpMakerComponent.query(By.css('.error'));
        expect(error).toBeTruthy(`there's no .error Element`);

        tick(1200);
      }));
    });
  });
});

@Component({
  template: `
    <div>Page not Found</div>
  `,
  selector: 'rcp-pnf'
})
class PageNotFoundComponent {}

@Component({
  selector: 'rcp-test',
  template: `
    <div>test component</div>
    <router-outlet></router-outlet>
  `
})
class TestComponent {}

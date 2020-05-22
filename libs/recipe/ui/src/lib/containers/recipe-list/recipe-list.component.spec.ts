import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Component, DebugElement, NgModule } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { By, HAMMER_LOADER } from '@angular/platform-browser';
import {
  ParamMap,
  convertToParamMap,
  Router,
  ActivatedRoute
} from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NxModule } from '@nrwl/angular';

import { BehaviorSubject, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { EntityDataService, RequestData, DataServiceError } from '@ngrx/data';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  StoreRouterConnectingModule,
  RouterStateSerializer
} from '@ngrx/router-store';

import { cold } from 'jasmine-marbles';

import { Recipe, RecipeFilters } from '@recipe-app-ngrx/models';
import { RcpEntityStoreModule } from '@recipe-app-ngrx/rcp-entity-store';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import {
  ENV_RCP,
  LogService,
  CustomRouterStateSerializer
} from '@recipe-app-ngrx/utils';
import { RecipePreviewComponent } from '../../components/recipe-preview/recipe-preview.component';
import { RecipeListComponent } from './recipe-list.component';

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

  category: { url: 'desserts', value: 'Desserts' },
  user_username: 'test_user',
  date_created: new Date(1)
};

describe('RecipeListComponent', () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let deRcpListComponent: DebugElement;
  let rcpListComponent: RecipeListComponent;

  let deRcpPreviewComponents: DebugElement[];
  // let rcpPreviewComponent: RecipePreviewComponent;

  const activatedRouteParamMap$ = new BehaviorSubject<ParamMap>(
    convertToParamMap({})
  );
  const activatedRoute = {
    paramMap: activatedRouteParamMap$.asObservable()
  };

  let router: Router;
  // let recipeEntityCollectionService: RecipeEntityCollectionService;
  let recipeDataService: any;
  let entityDataService: EntityDataService;
  let loadTotalNSpy: jasmine.Spy;
  let getCountFilteredRecipesSpy: jasmine.Spy;
  let getWithQuerySpy: jasmine.Spy;
  const pageSize = 3;
  const path: string[] = ['/recipes', 'all'];

  beforeEach(async(() => {
    @NgModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        StoreRouterConnectingModule.forRoot(),
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
          { path: 'recipes/:id', component: RecipeListComponent },
          { path: '**', component: PageNotFoundComponent }
        ]),
        HttpClientTestingModule
      ],
      declarations: [
        RecipeListComponent,
        RecipePreviewComponent,
        PageNotFoundComponent,
        TestComponent
      ],
      providers: [
        { provide: ENV_RCP, useValue: { production: false } },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: HAMMER_LOADER, useValue: () => new Promise(() => {}) },
        {
          provide: RouterStateSerializer,
          useClass: CustomRouterStateSerializer
        },
        LogService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);

    entityDataService = TestBed.get(EntityDataService);
    recipeDataService = entityDataService.getService('Recipe');

    loadTotalNSpy = spyOn(recipeDataService, 'getTotalNRecipes');
    getCountFilteredRecipesSpy = spyOn(
      recipeDataService,
      'getCountFilteredRecipes'
    );
    getWithQuerySpy = spyOn(recipeDataService, 'getWithQuery');
  });

  describe(`getCountFilteredRecipes; the remote server; SUCCESS`, () => {
    const countFilteredRecipes = 8;
    // countFilteredRecipes is very important. The code uses it to define whether to load extra recipes or not.
    // Also, the code uses it to define how much recipes should be loaded (number of recipes must be the pageSize or less than pageSize)
    // So when `countFilteredRecipes=0`, no recipe will be loaded, and when `countFilteredRecipes> 0`, recipes will be loaded.
    // Loading of recipes starts after setting value to `countFilteredRecipes`

    beforeEach(async(() => {
      getCountFilteredRecipesSpy.and.returnValue(
        of(countFilteredRecipes).pipe(delay(500))
      );
    }));

    it(`should paginator.length to be ${countFilteredRecipes}`, fakeAsync(() => {
      getWithQuerySpy.and.returnValue(of([]));
      router.navigate(path);
      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.pageSize = pageSize;

      // Wait for response from the server. The response contains countFilteredRecipes
      tick(501);
      fixture.detectChanges();

      expect(rcpListComponent.paginator.length).toBe(countFilteredRecipes);
      tick(50);
    }));

    it(`should load ${pageSize} recipes from the server after creation the component and getting value from countFilteredRecipes$; category='all'`, fakeAsync(() => {
      const recipes: Recipe[] = [
        recipe,
        { ...recipe, id: 1002 },
        { ...recipe, id: 1003 }
        // { ...recipe, id: 1004 },
      ];
      getWithQuerySpy.and.returnValue(of(recipes).pipe(delay(100)));
      router.navigate(path);
      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.pageSize = pageSize;
      tick(1);
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      let matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      let error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');

      // Wait for response from the server. The response contains countFilteredRecipes
      tick(501);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');

      // Wait for response from the server. The response contains `recipes`
      tick(101);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(3, '3 rcp-recipe-preview');

      tick(500);
    }));

    it(`should load ${pageSize} recipes from the server after clicking next button of the paginator; category='all'`, fakeAsync(() => {
      // Recipes are stored in descending order according to the date of their creation
      const recipes: Recipe[] = [
        { ...recipe, id: 1006, title: 'Recipe 6', date_created: new Date(6) },
        { ...recipe, id: 1005, title: 'Recipe 5', date_created: new Date(5) },
        { ...recipe, id: 1004, title: 'Recipe 4', date_created: new Date(4) },
        { ...recipe, id: 1003, title: 'Recipe 3', date_created: new Date(3) },
        { ...recipe, id: 1002, title: 'Recipe 2', date_created: new Date(2) },
        recipe
      ];
      getWithQuerySpy.and.returnValue(of(recipes.slice(0, 3)).pipe(delay(100)));
      router.navigate(path);
      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.pageSize = pageSize;
      tick(602);
      fixture.detectChanges();

      getWithQuerySpy.and.returnValue(of(recipes.slice(3, 6)).pipe(delay(100)));

      // const nextPaginatorButton: DebugElement = fixture.debugElement.query(By.css('.mat-paginator-navigation-next'));
      // nextPaginatorButton.triggerEventHandler('click', null);
      // show next page
      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.paginator.nextPage();

      tick(1);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      let matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      let error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');

      // Wait for response from the server. The response contains `recipes`
      tick(101);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(3, '3 rcp-recipe-preview');

      const recipePreviewEl: HTMLElement = deRcpPreviewComponents[0].query(
        By.css('.recipe-preview-card')
      ).nativeElement;
      expect(recipePreviewEl.innerHTML).toContain(
        recipes[3].title,
        recipes[3].title
      );
      tick(500);
    }));

    it(`shouldn't make call to the server, when there're 6 recipes, 4-6 are shown and user clicks 'prev' button of the paginator; category='all'`, fakeAsync(() => {
      // Recipes are stored in descending order according to the date of their creation
      const recipes: Recipe[] = [
        { ...recipe, id: 1006, title: 'Recipe 6', date_created: new Date(6) },
        { ...recipe, id: 1005, title: 'Recipe 5', date_created: new Date(5) },
        { ...recipe, id: 1004, title: 'Recipe 4', date_created: new Date(4) },
        { ...recipe, id: 1003, title: 'Recipe 3', date_created: new Date(3) },
        { ...recipe, id: 1002, title: 'Recipe 2', date_created: new Date(2) },
        recipe
      ];
      getWithQuerySpy.and.returnValue(of(recipes.slice(0, 3)).pipe(delay(100)));
      router.navigate(path);
      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.pageSize = pageSize;
      tick(602);
      fixture.detectChanges();

      getWithQuerySpy.and.returnValue(of(recipes.slice(3, 6)).pipe(delay(100)));

      // show next page
      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.paginator.nextPage();

      tick(1);
      fixture.detectChanges();

      // Wait for response from the server. The response contains `recipes`
      tick(101);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      let matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      let error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(3, '3 rcp-recipe-preview');

      let recipePreviewEl: HTMLElement = deRcpPreviewComponents[0].query(
        By.css('.recipe-preview-card')
      ).nativeElement;
      expect(recipePreviewEl.innerHTML).toContain(
        recipes[3].title,
        recipes[3].title
      );

      // show previous page
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.paginator.previousPage();

      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(3, '3 rcp-recipe-preview');

      recipePreviewEl = deRcpPreviewComponents[0].query(
        By.css('.recipe-preview-card')
      ).nativeElement;
      expect(recipePreviewEl.innerHTML).toContain(
        recipes[0].title,
        recipes[0].title
      );

      const filters: RecipeFilters = {
        category: null,
        username: null,
        page: 0,
        itemsPerPage: pageSize
      };
      // Comparison works. However, I doubt in it because there could be comparison of 2 different objects with the same props and values
      expect(getWithQuerySpy).not.toHaveBeenCalledWith(filters);
      tick();
    }));

    it(`should load from the server 2 recipes and show them  when 6 recipes are in the persistant store; category='all'`, fakeAsync(() => {
      // Recipes are stored in descending order according to the date of their creation
      const recipes: Recipe[] = [
        { ...recipe, id: 1008, title: 'Recipe 8', date_created: new Date(8) },
        { ...recipe, id: 1007, title: 'Recipe 7', date_created: new Date(7) },
        { ...recipe, id: 1006, title: 'Recipe 6', date_created: new Date(6) },
        { ...recipe, id: 1005, title: 'Recipe 5', date_created: new Date(5) },
        { ...recipe, id: 1004, title: 'Recipe 4', date_created: new Date(4) },
        { ...recipe, id: 1003, title: 'Recipe 3', date_created: new Date(3) },
        { ...recipe, id: 1002, title: 'Recipe 2', date_created: new Date(2) },
        recipe
      ];
      getWithQuerySpy.and.returnValue(of(recipes.slice(0, 3)).pipe(delay(100)));
      router.navigate(path);
      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.pageSize = pageSize;
      tick(602);
      fixture.detectChanges();

      getWithQuerySpy.and.returnValue(of(recipes.slice(3, 6)).pipe(delay(100)));

      // show next page
      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.paginator.nextPage();

      tick(1);
      fixture.detectChanges();

      // Wait for response from the server. The response contains `recipes`
      tick(101);
      fixture.detectChanges();

      getWithQuerySpy.and.returnValue(of(recipes.slice(6, 8)).pipe(delay(100)));
      // show next page
      rcpListComponent.paginator.nextPage();

      tick(1);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      let matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      let error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');

      // Wait for response from the server. The response contains `recipes`
      tick(101);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(2, '2 rcp-recipe-preview');

      let recipePreviewEl: HTMLElement = deRcpPreviewComponents[0].query(
        By.css('.recipe-preview-card')
      ).nativeElement;
      expect(recipePreviewEl.innerHTML).toContain(
        recipes[6].title,
        recipes[6].title
      );

      // show previous page
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.paginator.previousPage();

      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(3, '3 rcp-recipe-preview');

      recipePreviewEl = deRcpPreviewComponents[0].query(
        By.css('.recipe-preview-card')
      ).nativeElement;
      expect(recipePreviewEl.innerHTML).toContain(
        recipes[3].title,
        recipes[3].title
      );
    }));

    it(`should show error when server respondes the error after initializiation of the component and trying to load recipes; category='all'`, fakeAsync(() => {
      const reqData: RequestData = {
        method: 'GET',
        url: 'api/recipes/all'
      };
      const httpErrorRes = new HttpErrorResponse({
        error:
          'Error occured while trying to proxy to: localhost:4200/api/recipes/all',
        status: 504,
        statusText: 'Gateway Timeout',
        url: 'http://localhost:4200/api/recipes/all'
      });

      const err = new DataServiceError(httpErrorRes, reqData);

      getWithQuerySpy.and.returnValue(throwError(err).pipe(delay(100)));
      router.navigate(path);
      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.pageSize = pageSize;
      tick(1);
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      let matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      let error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');

      // Wait for response from the server. The response contains countFilteredRecipes
      tick(501);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');

      // Wait for response from the server. The response contains `recipes`
      tick(101);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeTruthy(`there's .error Element`);
      expect(error.nativeElement.innerHTML).toContain(
        httpErrorRes.error,
        httpErrorRes.error
      );
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');
    }));

    it(`should show error when server respondes the error after trying to load ${pageSize} extra recipes; 1-3 recipes are loaded and shown; category='all'`, fakeAsync(() => {
      const reqData: RequestData = {
        method: 'GET',
        url: 'api/recipes/all'
      };
      const httpErrorRes = new HttpErrorResponse({
        error:
          'Error occured while trying to proxy to: localhost:4200/api/recipes/all',
        status: 504,
        statusText: 'Gateway Timeout',
        url: 'http://localhost:4200/api/recipes/all'
      });
      const err = new DataServiceError(httpErrorRes, reqData);

      const recipes: Recipe[] = [
        { ...recipe, id: 1008, title: 'Recipe 8', date_created: new Date(8) },
        { ...recipe, id: 1007, title: 'Recipe 7', date_created: new Date(7) },
        { ...recipe, id: 1006, title: 'Recipe 6', date_created: new Date(6) }
      ];

      getWithQuerySpy.and.returnValue(of(recipes).pipe(delay(100)));
      router.navigate(path);
      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.pageSize = pageSize;
      tick(1);
      fixture.detectChanges();

      // Wait for response from the server. The response contains countFilteredRecipes
      // Wait for response from the server. The response contains `recipes`
      tick(601);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      let matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      let error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(3, '3 rcp-recipe-preview');

      getWithQuerySpy.and.returnValue(throwError(err).pipe(delay(100)));
      // show next page
      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.paginator.nextPage();

      tick(1);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');

      tick(101);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeTruthy(`there's .error Element`);
      expect(error.nativeElement.innerHTML).toContain(
        httpErrorRes.error,
        httpErrorRes.error
      );
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');
    }));

    it(`should update 'countFilteredRecipes' and load recipes when the route '/recipes/all' changes to '/recipes/salads'`, fakeAsync(() => {
      // Recipes are stored in descending order according to the date of their creation
      const recipes: Recipe[] = [
        { ...recipe, id: 1008, title: 'Recipe 8', date_created: new Date(8) },
        { ...recipe, id: 1007, title: 'Recipe 7', date_created: new Date(7) },
        { ...recipe, id: 1006, title: 'Recipe 6', date_created: new Date(6) },
        {
          ...recipe,
          id: 1005,
          title: 'Recipe 5',
          date_created: new Date(5),
          category: { url: 'salads' }
        },
        {
          ...recipe,
          id: 1004,
          title: 'Recipe 4',
          date_created: new Date(4),
          category: { url: 'salads' }
        },
        {
          ...recipe,
          id: 1003,
          title: 'Recipe 3',
          date_created: new Date(3),
          category: { url: 'salads' }
        },
        {
          ...recipe,
          id: 1002,
          title: 'Recipe 2',
          date_created: new Date(2),
          category: { url: 'salads' }
        },
        recipe
      ];
      getWithQuerySpy.and.returnValue(of(recipes.slice(0, 3)).pipe(delay(100)));
      router.navigate(path);
      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.pageSize = pageSize;

      // Wait for response from server; response contains 'countFilteredRecipes' and 'recipes'
      tick(602);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      let matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      let error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(3, '3 rcp-recipe-preview');

      let recipePreviewEl: HTMLElement = deRcpPreviewComponents[0].query(
        By.css('.recipe-preview-card')
      ).nativeElement;
      expect(recipePreviewEl.innerHTML).toContain(
        recipes[0].title,
        recipes[0].title
      );

      // change spies and navigate to '/recipes/salads'
      const countFilteredRec = 11;
      getCountFilteredRecipesSpy.and.returnValue(
        of(countFilteredRec).pipe(delay(500))
      );
      getWithQuerySpy.and.returnValue(of(recipes.slice(3, 6)).pipe(delay(100)));
      router.navigate(['/recipes', 'salads']);

      tick();
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');

      // Wait for response from server; response contains 'countFilteredRecipes' and 'recipes'
      tick(501);
      fixture.detectChanges();

      // Now recipes should be loading. But the old value of 'countFilteredRecipes' > 0 and
      // therefore the code sends request for recipes at the same time as request for 'countFilteredRecipes' starts
      // Providing the delay for the response with recipes is less than the one for 'countFilteredRecipes'
      // in the test the response with recipes will come earlier that the11 response with the 'countFilteredRecipes'

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      expect(deRcpListComponent.componentInstance.paginator.length).toBe(
        countFilteredRec,
        countFilteredRec
      );
      // matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      // expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      // error = deRcpListComponent.query(By.css('.error'));
      // expect(error).toBeFalsy(`there's no .error Element`);
      // deRcpPreviewComponents = deRcpListComponent.queryAll(By.css('rcp-recipe-preview'));
      // expect(deRcpPreviewComponents.length).toBe(0, '100 rcp-recipe-preview');

      // // Wait for response from the server. The response contains `recipes`
      // tick(101);
      // fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);
      error = deRcpListComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpPreviewComponents = deRcpListComponent.queryAll(
        By.css('rcp-recipe-preview')
      );
      expect(deRcpPreviewComponents.length).toBe(3, '3 rcp-recipe-preview');

      recipePreviewEl = deRcpPreviewComponents[0].query(
        By.css('.recipe-preview-card')
      ).nativeElement;
      expect(recipePreviewEl.innerHTML).toContain(
        recipes[3].title,
        recipes[3].title
      );
    }));

    // + should paginator length to be countFilteredRecipes
    // + should load ${pageSize} recipes from the server after creation and getting value from countFilteredRecipes$;
    // check .mat-spinner, .error and .recipesList;
    // + should load ${pageSize} recipes from the server after clicking next button of the paginator.
    // check .mat-spinner, .error and .recipesList;
    // + shouldn't make call to the server, when there're 6 recipes, 4-6 are shown and user clicks 'prev' button of the paginator

    // + should load from the server 2 recipes and show them  when 6 recipes are in the persistant state
    // + should show error when server respondes the error after initializiation of the component
    // + should show error when server respondes the error during loading 3 extra recipes

    // + should update countFilteredRecipes and load recipes when 'id' changes in the route '/recipes/:id'. 'id' can be the category or username
  });

  describe(`getCountFilteredRecipes; remote server; ERROR`, () => {
    const countFilteredRecipes = 8;
    // countFilteredRecipes is very important. The code uses it to define whether to load extra recipes or not.
    // Also, the code uses it to define how much recipes should be loaded (number of recipes must be the pageSize or less than pageSize)
    // So when `countFilteredRecipes=0`, no recipe will be loaded, and when `countFilteredRecipes> 0`, recipes will be loaded.
    // Loading of recipes starts after setting value to `countFilteredRecipes`
    const reqData: RequestData = {
      method: 'GET',
      url: 'api/recipes/countFilteredRecipes'
    };
    const httpErrorRes = new HttpErrorResponse({
      error:
        'Error occured while trying to proxy to: localhost:4200/api/recipes/countFilteredRecipes',
      status: 504,
      statusText: 'Gateway Timeout',
      url: 'http://localhost:4200/api/recipes/countFilteredRecipes'
    });
    const err = new DataServiceError(httpErrorRes, reqData);
    beforeEach(async(() => {
      getCountFilteredRecipesSpy.and.returnValue(
        throwError(err).pipe(delay(400))
      );
    }));

    it(`should paginator.length be 0 `, fakeAsync(() => {
      getWithQuerySpy.and.returnValue(of([]));
      router.navigate(path);
      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      rcpListComponent.pageSize = pageSize;
      expect(rcpListComponent.paginator.length).toBe(0);

      // Wait for response from the server. The response contains countFilteredRecipes
      tick(501);
      fixture.detectChanges();

      expect(rcpListComponent.paginator.length).toBe(0);
    }));

    // it(`should show the error`, fakeAsync(() => {
    //   // getWithQuerySpy.and.returnValue(of([]));
    //   router.navigate(path);
    //   tick(100);
    //   fixture.detectChanges();

    //   deRcpListComponent =  fixture.debugElement.query(By.css('rcp-recipe-list'));
    //   rcpListComponent = deRcpListComponent.componentInstance;
    //   rcpListComponent.pageSize = pageSize;

    //   // Wait for response from the server. The response contains countFilteredRecipes
    //   tick(501);
    //   fixture.detectChanges();

    //   deRcpListComponent =  fixture.debugElement.query(By.css('rcp-recipe-list'));

    //   const deErrorEl = deRcpListComponent.query(By.css('.error'));
    //   expect(deErrorEl).toBeTruthy(`there's .error`);
    //   expect(deErrorEl.nativeElement.innerHTML).toContain(httpErrorRes.error);

    //   const matSpinner = deRcpListComponent.query(By.css('.mat-spinner'));
    //   expect(matSpinner).toBeFalsy(`there's no .mat-spinner`);

    //   deRcpPreviewComponents = deRcpListComponent.queryAll(By.css('rcp-recipe-preview'));
    //   expect(deRcpPreviewComponents.length).toBe(0, '0 rcp-recipe-preview');
    //   tick(601);

    // }));

    it(`shouldn't load ${pageSize} recipes from the server after creation`, fakeAsync(() => {
      // getWithQuerySpy.and.returnValue(of([]));
      router.navigate(path);
      tick();
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;

      // Wait for response from the server. The response contains countFilteredRecipes
      tick(501);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      let completion = cold('a', { a: [] });
      expect(rcpListComponent.filteredRecipes$).toBeObservable(completion);

      // Wait for response from the server. The response contains countFilteredRecipes
      tick(501);
      fixture.detectChanges();

      deRcpListComponent = fixture.debugElement.query(
        By.css('rcp-recipe-list')
      );
      rcpListComponent = deRcpListComponent.componentInstance;
      completion = cold('a', { a: [] });
      expect(rcpListComponent.filteredRecipes$).toBeObservable(completion);
    }));

    // should paginator length to be 0
    // should show the error
    // shouldn't load ${pageSize} recipes from the server after creation
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
    <div>RecipeListComponent wrapper</div>
    <router-outlet></router-outlet>
  `
})
class TestComponent {}

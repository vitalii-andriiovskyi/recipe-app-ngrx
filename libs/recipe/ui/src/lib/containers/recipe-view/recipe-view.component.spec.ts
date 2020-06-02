import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, NgModule } from '@angular/core';
import {
  ParamMap,
  convertToParamMap,
  ActivatedRoute,
  Router
} from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { NxModule } from '@nrwl/angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { EntityOp, RequestData } from '@ngrx/data';

import { RecipeViewComponent } from './recipe-view.component';
import { Recipe } from '@recipe-app-ngrx/models';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { RcpEntityStoreModule } from '@recipe-app-ngrx/rcp-entity-store';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { RecipeDetailComponent } from '../../components/recipe-detail/recipe-detail.component';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { ENV_RCP, LogService } from '@recipe-app-ngrx/utils';
import { cold } from 'jasmine-marbles';
import { delay } from 'rxjs/operators';

const recipe: Recipe = {
  id: 1001,
  title: 'Lorem ipsum dolor, sit amet cconsectetur ',
  title_slugged: 'recipe-1',
  description: `Lorem ipsum dolor, sit amet consectetur consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.`,
  ingredients: [
    {
      id: 0,
      name: 'bread',
      quantity: 2,
      unit: 'kg'
    },
    {
      id: 0,
      name: 'bread',
      quantity: 2,
      unit: 'pieces'
    },
    {
      id: 0,
      name: 'bread',
      quantity: 2,
      unit: 'units'
    },
    {
      id: 0,
      name: 'bread',
      quantity: 2,
      unit: 'kg'
    }
  ],
  steps: [
    `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.`,
    `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.`,
    `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.`,
    `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.`
  ],
  images: [],
  footnotes: 'Some info',
  nutritionFacts: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.`,
  preparationTime: 12,
  cookTime: 12,
  servingsNumber: 6,

  category: { url: 'desserts', value: 'Desserts' },
  user_username: 'test_user',
  date_created: new Date()
};

describe('RecipeViewComponent', () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let deRcpViewComponent: DebugElement;
  let rcpViewComponent: RecipeViewComponent;

  let deRcpDetailComponent: DebugElement;

  const loggedIn$ = new BehaviorSubject<boolean>(false);
  const activatedRouteParamMap$ = new BehaviorSubject<ParamMap>(
    convertToParamMap({})
  );
  const activatedRoute = {
    paramMap: activatedRouteParamMap$.asObservable()
  };

  let getHttpGetSpy: jasmine.Spy;

  let router: Router;
  let recipeEntityCollectionService: RecipeEntityCollectionService;

  beforeEach(async(() => {
    const authFacadeSpy = jasmine.createSpyObj('AuthFacade', ['loginRedirect']);
    authFacadeSpy.loggedIn$ = loggedIn$.asObservable();

    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
    getHttpGetSpy = httpSpy.get;

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
          { path: 'recipe/:id', component: RecipeViewComponent },
          { path: '**', component: PageNotFoundComponent }
        ])
      ],
      declarations: [
        RecipeViewComponent,
        RecipeDetailComponent,
        PageNotFoundComponent,
        TestComponent
      ],
      providers: [
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
    router = TestBed.inject(Router);

    deRcpViewComponent = fixture.debugElement.query(By.css('rcp-recipe-maker'));
  });

  describe(`route='/recipe/:id'; recipe is in persistant state`, () => {
    const path = '/recipe/1001';

    beforeEach(async(() => {
      recipeEntityCollectionService = TestBed.inject(
        RecipeEntityCollectionService
      );
      recipeEntityCollectionService.createAndDispatch(EntityOp.ADD_ONE, recipe);
      // navigate to RecipeViewComponent
      router.navigate([path]);
      activatedRouteParamMap$.next(convertToParamMap({ id: 1001 }));
    }));

    it(`component should be created`, () => {
      fixture.detectChanges();

      deRcpViewComponent = fixture.debugElement.query(
        By.css('rcp-recipe-view')
      );
      expect(deRcpViewComponent).toBeTruthy('RecipeViewComponent is created');
    });

    it(`should show RecipeDetailComponent; .error and mat-spinner aren't created`, () => {
      fixture.detectChanges();

      deRcpDetailComponent = fixture.debugElement.query(
        By.css('rcp-recipe-detail')
      );
      expect(deRcpDetailComponent).toBeTruthy(
        'RecipeDetailComponent is created'
      );

      const errorContainer = fixture.debugElement.query(By.css('.error'));
      expect(errorContainer).toBeFalsy(".error isn't created");
      const matSpinner = fixture.debugElement.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy(".mat-spinner isn't created");
    });

    it(`recipe$ pass 'recipe'`, () => {
      fixture.detectChanges();

      deRcpViewComponent = fixture.debugElement.query(
        By.css('rcp-recipe-view')
      );
      rcpViewComponent = deRcpViewComponent.componentInstance;

      const expected = cold('a', { a: recipe });
      expect(rcpViewComponent.recipe$).toBeObservable(expected);
    });

    it(`loading$ pass false`, fakeAsync(() => {
      fixture.detectChanges();

      deRcpViewComponent = fixture.debugElement.query(
        By.css('rcp-recipe-view')
      );
      rcpViewComponent = deRcpViewComponent.componentInstance;
      rcpViewComponent.loading$.subscribe(val => {
        expect(val).toBeFalsy('loading$ passes false');
      });

      tick(1000);
    }));
  });

  describe(`route='/recipe/:id'; recipe is in persistant state`, () => {
    const path = '/recipe/1001';

    beforeEach(async(() => {
      recipeEntityCollectionService = TestBed.inject(
        RecipeEntityCollectionService
      );
    }));

    it(`should load recipe from the server`, fakeAsync(() => {
      getHttpGetSpy.and.returnValue(of(recipe).pipe(delay(1000)));
      // navigate to RecipeMakerComponent
      router.navigate([path]);

      tick(1);
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      deRcpViewComponent = fixture.debugElement.query(
        By.css('rcp-recipe-view')
      );
      let matSpinner = deRcpViewComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      let error = deRcpViewComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpDetailComponent = deRcpViewComponent.query(
        By.css('rcp-recipe-detail')
      );
      expect(deRcpDetailComponent).toBeFalsy(
        "RecipeDetailComponent isn't created"
      );

      tick(1001);
      fixture.detectChanges();
      deRcpViewComponent = fixture.debugElement.query(
        By.css('rcp-recipe-view')
      );
      matSpinner = deRcpViewComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy('mat-spinner shows loading');

      deRcpViewComponent = fixture.debugElement.query(
        By.css('rcp-recipe-view')
      );
      rcpViewComponent = deRcpViewComponent.componentInstance;
      const expected = cold('a', { a: recipe });
      expect(rcpViewComponent.recipe$).toBeObservable(expected);

      deRcpDetailComponent = fixture.debugElement.query(
        By.css('rcp-recipe-detail')
      );
      expect(deRcpDetailComponent).toBeTruthy(
        'RecipeDetailComponent is created'
      );
      expect(deRcpDetailComponent.componentInstance.recipe.id).toBe(
        recipe.id,
        recipe.id
      );

      error = deRcpViewComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);

      tick(1200);
    }));

    it(`should show the error when can't load recipe from the server`, fakeAsync(() => {
      const errorRes: HttpErrorResponse = new HttpErrorResponse({
        error: new Error('recipe is not saved'),
        status: 400,
        url: 'api/recipe/1001'
      });
      getHttpGetSpy.and.returnValue(throwError(errorRes).pipe(delay(1000)));
      // navigate to RecipeMakerComponent
      router.navigate([path]);

      tick(1);
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      deRcpViewComponent = fixture.debugElement.query(
        By.css('rcp-recipe-view')
      );
      let matSpinner = deRcpViewComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeTruthy('mat-spinner shows loading');
      let error = deRcpViewComponent.query(By.css('.error'));
      expect(error).toBeFalsy(`there's no .error Element`);
      deRcpDetailComponent = deRcpViewComponent.query(
        By.css('rcp-recipe-detail')
      );
      expect(deRcpDetailComponent).toBeFalsy(
        "RecipeEditorComponent isn't created"
      );

      tick(1001);
      fixture.detectChanges();

      deRcpViewComponent = fixture.debugElement.query(
        By.css('rcp-recipe-view')
      );
      matSpinner = deRcpViewComponent.query(By.css('.mat-spinner'));
      expect(matSpinner).toBeFalsy('mat-spinner shows loading');

      deRcpDetailComponent = deRcpViewComponent.query(
        By.css('rcp-recipe-detail')
      );
      expect(deRcpDetailComponent).toBeFalsy(
        "RecipeEditorComponent isn't created"
      );

      error = deRcpViewComponent.query(By.css('.error'));
      expect(error).toBeTruthy(`there's no .error Element`);

      tick(1200);
    }));
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
    <div>RecipeViewComponent</div>
    <router-outlet></router-outlet>
  `
})
class TestComponent {}

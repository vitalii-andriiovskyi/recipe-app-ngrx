import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, NgModule } from '@angular/core';
import { ParamMap, convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { NxModule } from '@nrwl/nx';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { EntityOp } from 'ngrx-data';

import { RecipeViewComponent } from './recipe-view.component';
import { Recipe } from '@recipe-app-ngrx/models';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { RcpEntityStoreModule } from '@recipe-app-ngrx/rcp-entity-store';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { RecipeDetailComponent } from '../../components/recipe-detail/recipe-detail.component';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { ENV_RCP, LogService } from '@recipe-app-ngrx/utils';

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
    `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.`,
  ],
  images: [],
  footnotes: 'Some info',
  nutritionFacts: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iusto reiciendis rerum vitae nulla enim fugiat ipsa doloribus, ipsam officia corrupti.`,
  preparationTime: 12,
  cookTime: 12,
  servingsNumber: 6,

  category: { url: 'desserts', value: 'Desserts' },
  user_username: 'test_user',
  date_created: new Date(),
};

describe('RecipeViewComponent', () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let deRcpViewComponent: DebugElement;
  let rcpViewComponent: RecipeViewComponent;

  let deRcpDetailComponent: DebugElement;

  const loggedIn$ = new BehaviorSubject<boolean>(false);
  const activatedRouteParamMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));
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
        RcpEntityStoreModule,
      ],
    })
    class RootModule {};

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
      declarations: [RecipeViewComponent, RecipeDetailComponent, PageNotFoundComponent, TestComponent ],
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
    router = TestBed.get(Router);

    deRcpViewComponent = fixture.debugElement.query(By.css('rcp-recipe-maker'));
  });

  describe(`route='/recipe/:id'; recipe is in persistant state`, () => {
    const path = '/recipe/1001';

    beforeEach(async(() => {
      recipeEntityCollectionService = TestBed.get(RecipeEntityCollectionService);
      recipeEntityCollectionService.createAndDispatch(EntityOp.ADD_ONE, recipe);
      // navigate to RecipeViewComponent
      router.navigate([path]);
    }));

    it(`component should be created`, () => {
      fixture.detectChanges();

      deRcpViewComponent = fixture.debugElement.query(By.css('rcp-recipe-maker'));
      expect(deRcpViewComponent).toBeTruthy('is created');
    });

    it(`should show RecipeDetailComponent`, () => {
      fixture.detectChanges();
      
      deRcpDetailComponent = fixture.debugElement.query(By.css('rcp-recipe-detail'));
      expect(deRcpDetailComponent).toBeTruthy('is created');
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
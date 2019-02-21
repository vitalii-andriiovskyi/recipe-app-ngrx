import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeListComponent } from './recipe-list.component';
import { Component, DebugElement, NgModule } from '@angular/core';
import { Recipe } from '@recipe-app-ngrx/models';
import { RecipePreviewComponent } from '../../components/recipe-preview/recipe-preview.component';
import { BehaviorSubject } from 'rxjs';
import { ParamMap, convertToParamMap, Router, ActivatedRoute } from '@angular/router';
import { RecipeEntityCollectionService } from '@recipe-app-ngrx/recipe/state';
import { EntityDataService } from 'ngrx-data';
import { NxModule } from '@nrwl/nx';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RcpEntityStoreModule } from '@recipe-app-ngrx/rcp-entity-store';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ENV_RCP, LogService } from '@recipe-app-ngrx/utils';
import { By } from '@angular/platform-browser';

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

  category: { url: 'desserts' },
  user_username: 'test_user',
  date_created: new Date(),
};

describe('RecipeListComponent', () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let deRcpListComponent: DebugElement;
  let rcpListComponent: RecipeListComponent;

  let deRcpPreviewComponent: DebugElement;
  let rcpPreviewComponent: RecipePreviewComponent;

  const activatedRouteParamMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));
  const activatedRoute = {
    paramMap: activatedRouteParamMap$.asObservable()
  };

  let router: Router;
  let recipeEntityCollectionService: RecipeEntityCollectionService;
  let recipeDataService: any;
  let entityDataService: EntityDataService;
  let loadTotalNSpy: jasmine.Spy;
  let getCountFilteredRecipesSpy: jasmine.Spy;
  let getWithQuerySpy: jasmine.Spy;

  beforeEach(async(() => {

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
          { path: 'recipes/:id', component: RecipeListComponent },
          { path: '**', component: PageNotFoundComponent }
        ]),
        HttpClientTestingModule
      ],
      declarations: [ RecipeListComponent, RecipePreviewComponent , PageNotFoundComponent, TestComponent ],
      providers: [
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
    deRcpListComponent =  fixture.debugElement.query(By.css('rcp-recipe-list'));

    entityDataService = TestBed.get(EntityDataService);
    recipeDataService = entityDataService.getService('Recipe');
    loadTotalNSpy = spyOn(recipeDataService, 'getTotalNRecipes');
    getCountFilteredRecipesSpy = spyOn(recipeDataService, 'getCountFilteredRecipes');
    getWithQuerySpy = spyOn(recipeDataService, 'getWithQuery');
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});


@Component({
  template: `<div>Page not Found</div>`,
  selector: 'rcp-pnf'
})
class PageNotFoundComponent { }

@Component({
  selector: 'rcp-test',
  template: `<div>RecipeListComponent wrapper</div><router-outlet></router-outlet>`
})
class TestComponent { }

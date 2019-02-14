import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { RecipeMakerComponent } from './recipe-maker.component';
import { BehaviorSubject } from 'rxjs';
import { User, Recipe } from '@recipe-app-ngrx/models';
import { RecipeEditorComponent } from '../../components/recipe-editor/recipe-editor.component';
import { Component, NgModule, DebugElement } from '@angular/core';
import { NxModule } from '@nrwl/nx';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgrxDataModule } from 'ngrx-data';
import { RcpEntityStoreModule } from '@recipe-app-ngrx/rcp-entity-store';
import { TemporaryIdGenerator, ENV_RCP, LogService } from '@recipe-app-ngrx/utils';
import { HttpClient } from '@angular/common/http';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AuthFacade, AuthGuard } from '@recipe-app-ngrx/auth/state';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { SharedComponentsModule } from '@recipe-app-ngrx/shared-components';
import { cold } from 'jasmine-marbles';

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

  let loginRedirectSpy: jasmine.Spy;
  let getHttpPostSpy: jasmine.Spy;
  let getHttpGetSpy: jasmine.Spy;

  let router: Router;

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

    // @NgModule({
    //   imports: [],
    //   providers: [
    //     { provide: ENTITY_METADATA_TOKEN, multi: true, useValue: recipeEntityMetadata },
    //     // { provide: RecipeDataService, useValue: recipeDataServiceSpy }
    //     RecipeDataService,
    //     EntityCollectionReducerRegistry
    //   ]
    // })
    // class CustomFeatureModule {
    //   constructor(
    //     entityDataService: EntityDataService,
    //     recipeDataService: RecipeDataService,
    //   ) {
    //     entityDataService.registerService('Recipe', recipeDataService);
    //   }
    // }

    @NgModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        // StoreRouterConnectingModule.forRoot(),
        RcpEntityStoreModule,
      ],
      // providers: [ RecipeEntityCollectionService ]
      // providers: [
      //   AppEntityServices,
      //   { provide: EntityServices, useExisting: AppEntityServices },
      //   { provide: ENTITY_COLLECTION_META_REDUCERS, useValue: [recipeMetaReducer] }
      // ]
    })
    class RootModule {}
 
    TestBed.configureTestingModule({
      imports: [ 
        RootModule,
        SharedComponentsModule,
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
  });

  describe(`loggedIn='false' and user isn't authenticated`, () => {
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


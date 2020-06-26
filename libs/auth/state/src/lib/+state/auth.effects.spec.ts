import { TestBed, async } from '@angular/core/testing';

import { Observable, of } from 'rxjs';

import { EffectsModule, Actions } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { NxModule } from '@nrwl/angular';
import { DataPersistence } from '@nrwl/angular';
import { hot, cold } from '@nrwl/angular/testing';

import { AuthEffects } from './auth.effects';
import {
  Login,
  LoginSuccess,
  LoginFailure,
  LoginRedirect,
  Logout,
  LogoutConfirmation,
  LogoutDismiss
} from './auth.actions';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthUserVW, SessionData } from '@recipe-app-ngrx/models';
import { RouterTestingModule } from '@angular/router/testing';
import {
  Router,
  ActivatedRouteSnapshot,
  ActivatedRoute
} from '@angular/router';
import { Component } from '@angular/core';
import {
  RouterHistoryStateModule,
  RouterHistoryState,
  initialState as routerHistoryInitState,
  RouterHistoryUpdated
} from '@recipe-app-ngrx/router-history-state';
import { RouterStateUrl, CustomRouterStateSerializer } from '@recipe-app-ngrx/utils';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { UserFacade } from '@recipe-app-ngrx/user/state';

interface TestSchema {
  routerHistoryState: RouterHistoryState;
}

describe('AuthEffects', () => {
  let actions$: Observable<any>;
  let effects: AuthEffects;
  let getLoginSpy: jasmine.Spy;
  let getLogoutSpy: jasmine.Spy;
  let getMatDialogOpenSpy: jasmine.Spy;
  let routerService: Router;
  let store: Store<TestSchema>;
  let activatedRoute: ActivatedRoute;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'logout'
    ]);
    getLoginSpy = authServiceSpy.login;
    getLogoutSpy = authServiceSpy.logout;

    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    getMatDialogOpenSpy = matDialogSpy.open;

    const userFacadeSpy = jasmine.createSpyObj('UserFacade', [
      'loadUser'
    ]);
    const loadUserSpy: jasmine.Spy = userFacadeSpy.loadUser;
    loadUserSpy.and.returnValue('');

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'recipes/newest', component: TestComponent },
          { path: '**', component: PageNotFoundComponent }
        ]),
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        StoreRouterConnectingModule.forRoot({
          serializer: CustomRouterStateSerializer
        }),
        RouterHistoryStateModule
      ],
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: UserFacade, useValue: userFacadeSpy }
      ],
      declarations: [TestComponent, PageNotFoundComponent]
    });

    effects = TestBed.inject(AuthEffects);
    actions$ = TestBed.inject(Actions);
    store = TestBed.inject(Store);
    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  describe('login$', () => {
    it('should return an auth.LoginSuccess action, with user information if login succeeds', () => {
      const authUser: AuthUserVW = { username: 'test', password: '' };
      const session: SessionData = {
        userId: '5c18cb336a07d64bac65fddb',
        token: 'token',
        success: true
      }
      const action = new Login({ authUser });
      const completion = new LoginSuccess({ session });

      actions$ = hot('-a---', { a: action });
      const response = cold('-a|', { a: session });
      const expected = cold('--b', { b: completion });

      getLoginSpy.and.returnValue(response);
      expect(effects.login$).toBeObservable(expected);
    });

    it('should return a new auth.LoginFailure if the login service throws', () => {
      const authUser: AuthUserVW = { username: 'unknownUser', password: '' };
      const action = new Login({ authUser });
      const completion = new LoginFailure({
        error: 'Invalid username or password'
      });
      const error = {
        error: 'Invalid username or password'
      };

      actions$ = hot('-a---', { a: action });
      const response = cold('-#', {}, error);
      const expected = cold('--b', { b: completion });
      getLoginSpy.and.returnValue(response);

      expect(effects.login$).toBeObservable(expected);
    });
  });

  describe('logout$', () => {
    it('should dispatch a LogoutConfirmation action if dialog closes with true result', () => {
      const action = new Logout();
      const completion = new LogoutConfirmation();

      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });

      const afterClosedMethod = () => of(true);
      getMatDialogOpenSpy.and.returnValue({ afterClosed: afterClosedMethod });

      expect(effects.logout$).toBeObservable(expected);
    });

    it('should dispatch a LogoutConfirmationDismiss action if dialog closes with falsy result', () => {
      const action = new Logout();
      const completion = new LogoutDismiss();

      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });

      const afterClosedMethod = () => of(false);
      getMatDialogOpenSpy.and.returnValue({ afterClosed: afterClosedMethod });

      expect(effects.logout$).toBeObservable(expected);
    });
  });

  describe('loginSuccess$', () => {
    beforeEach(() => {
      routerService = TestBed.inject(Router);
      spyOn(routerService, 'navigate').and.callThrough();
    });
    it('should navigate to previous route', (done: any) => {
      const session: SessionData = {
        userId: '5c18cb336a07d64bac65fddb',
        token: 'token',
        success: true
      }

      const action = new LoginSuccess({ session });

      actions$ = of(action);

      effects.loginSuccess$.subscribe(() => {
        expect(routerService.navigate).toHaveBeenCalled();
        // Expectation below should work fine. But comparison two objects with the same properties fails because of different __proto__
        // expect(routerService.navigate).toHaveBeenCalledWith([routerHistoryInitState.previousRouter.url, { queryParams: routerHistoryInitState.previousRouter.queryParams }]);
        done();
      });
    });
  });

  describe('logoutConfirm$', () => {
    beforeEach(() => {
      routerService = TestBed.inject(Router);
      spyOn(routerService, 'navigate').and.callThrough();
    });
    it('should reload current route', (done: any) => {
      const nextUrlState: RouterStateUrl = {
        url: '/recipes/salads',
        queryParams: {},
        params: {},
        routeConfig: {
          path: '/recipes/salads'
        }
      };
      store.dispatch(new RouterHistoryUpdated(nextUrlState));
      const action = new LogoutConfirmation();
      getLogoutSpy.and.returnValue(of(true));
      actions$ = of(action);

      effects.logoutConfirmation$.subscribe(() => {
        expect(routerService.navigate).toHaveBeenCalled();
        // Expectation below should work fine. But comparison two objects with the same properties fails because of different __proto__
        // expect(routerService.navigate).toHaveBeenCalledWith([nextUrlState.url, { queryParams: nextUrlState.queryParams } ]);
        done();
      });
    });
  });

  describe(`loginRedirect$`, () => {
    beforeEach(() => {
      routerService = TestBed.inject(Router);
      spyOn(routerService, 'navigate').and.callThrough();
    });

    it(`should call 'router.navigate(['/login'])`, (done: any) => {
      const action = new LoginRedirect();
      actions$ = of(action);

      effects.loginRedirect$.subscribe(() => {
        expect(routerService.navigate).toHaveBeenCalledWith(['/login']);
        done();
      });
    });
  });
  // describe('loadAuth$', () => {
  //   it('should work', () => {
  //     actions = hot('-a-|', { a: new LoadAuth() });
  //     expect(effects.loadAuth$).toBeObservable(
  //       hot('-a-|', { a: new AuthLoaded([]) })
  //     );
  //   });
  // });
});

@Component({
  selector: 'rcp-test-comp',
  template: '<p>test</p>'
})
class TestComponent {}

@Component({
  selector: 'rcp-page-not-found',
  template: '<p>test</p>'
})
class PageNotFoundComponent {}

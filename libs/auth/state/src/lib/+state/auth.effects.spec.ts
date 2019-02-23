import { TestBed, async } from '@angular/core/testing';

import { Observable, of } from 'rxjs';

import { EffectsModule, Actions } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { NxModule } from '@nrwl/nx';
import { DataPersistence } from '@nrwl/nx';
import { hot, cold } from '@nrwl/nx/testing';

import { AuthEffects } from './auth.effects';
import { 
  Login,
  LoginSuccess,
  LoginFailure,
  LoginRedirect,
  Logout,
  LogoutConfirmation,
  LogoutDismiss } from './auth.actions';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material';
import { AuthUserVW, User } from '@recipe-app-ngrx/models';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { RouterHistoryStateModule, RouterHistoryState, initialState as routerHistoryInitState } from '@recipe-app-ngrx/router-history-state';
import { RouterStateUrl } from '@recipe-app-ngrx/utils';
import { StoreRouterConnectingModule } from '@ngrx/router-store';

describe('AuthEffects', () => {
  let actions$: Observable<any>;
  let effects: AuthEffects;
  let getLoginSpy: jasmine.Spy;
  let getLogoutSpy: jasmine.Spy;
  let getMatDialogOpenSpy: jasmine.Spy;
  let routerService: Router;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'logout']);
    getLoginSpy = authServiceSpy.login;
    getLogoutSpy = authServiceSpy.logout;

    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    getMatDialogOpenSpy = matDialogSpy.open;
    
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'recipes/newest', component: TestComponent},
          { path: '**', component: PageNotFoundComponent},
        ]),
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        StoreRouterConnectingModule,
        RouterHistoryStateModule,
      ],
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authServiceSpy},
        { provide: MatDialog, useValue: matDialogSpy }
      ],
      declarations: [ TestComponent, PageNotFoundComponent ]
    });

    effects = TestBed.get(AuthEffects);
    actions$ = TestBed.get(Actions);
  });


  describe('login$', () => {
    it('should return an auth.LoginSuccess action, with user information if login succeeds', () => {
      const authUser: AuthUserVW = { username: 'test', password: '' };
      const user = {
        _id: '',
        username: 'test_name',
        password: '',
        firstName: '',
        lastName: '',
        email: ''
      } as User;
      const action = new Login({ authUser });
      const completion = new LoginSuccess({ user });

      actions$ = hot('-a---', { a: action });
      const response = cold('-a|', { a: user });
      const expected = cold('--b', { b: completion });

      getLoginSpy.and.returnValue(response);
      expect(effects.login$).toBeObservable(expected);
    });

    it('should return a new auth.LoginFailure if the login service throws', () => {
      const authUser: AuthUserVW = { username: 'unknownUser', password: '' };
      const action = new Login({ authUser });
      const completion = new LoginFailure({
        error: 'Invalid username or password',
      });
      const error = {
        error: 'Invalid username or password',
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
      getMatDialogOpenSpy.and.returnValue({afterClosed: afterClosedMethod});

      expect(effects.logout$).toBeObservable(expected);
    });

    it('should dispatch a LogoutConfirmationDismiss action if dialog closes with falsy result', () => {
      const action = new Logout();
      const completion = new LogoutDismiss();

      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });

      const afterClosedMethod = () => of(false);
      getMatDialogOpenSpy.and.returnValue({afterClosed: afterClosedMethod});

      expect(effects.logout$).toBeObservable(expected);
    });
  });

  describe('loginSuccess$', () => {
    beforeEach(() => {
      routerService = TestBed.get(Router);
      spyOn(routerService, 'navigate').and.callThrough();
    })
    it('should dispatch a RouterNavigation action', (done: any) => {
      const user = {
        _id: '',
        username: 'test_name',
        password: '',
        firstName: '',
        lastName: '',
        email: ''
      } as User;

      const action = new LoginSuccess({ user });
      
      actions$ = of(action);

      effects.loginSuccess$.subscribe(() => {
        expect(routerService.navigate).toHaveBeenCalledWith([routerHistoryInitState.previousRouter.url]);
        done();
      });
    });
  });

  describe(`loginRedirect$`, () => {
    beforeEach(() => {
      routerService = TestBed.get(Router);
      spyOn(routerService, 'navigate').and.callThrough();
    });

    it(`should call 'router.navigate(['/login'])`, (done: any) => {
      const action = new LoginRedirect();
      actions$ = of(action);
  
      effects.loginRedirect$.subscribe(() => {
        expect(routerService.navigate).toHaveBeenCalledWith(['/login']);
        done();
      })
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
class TestComponent {
}

@Component({
  selector: 'rcp-page-not-found',
  template: '<p>test</p>'
})
class PageNotFoundComponent {

}

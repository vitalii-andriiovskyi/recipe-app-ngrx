import { NgModule, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { readFirst } from '@nrwl/nx/testing';
import { MatDialog } from '@angular/material';
import { of, throwError } from 'rxjs';

import { StoreModule, Store } from '@ngrx/store';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';
import { Router } from '@angular/router';

import { NxModule } from '@nrwl/nx';

import { AuthEffects } from './auth.effects';
import { AuthFacade } from './auth.facade';

import { authQuery } from './auth.selectors';
import { Login, Logout } from './auth.actions';
import { AuthState, initialState, authReducer } from './auth.reducer';
import { AuthService } from '../services/auth.service';
import { User } from '@recipe-app-ngrx/models';
import { RouterHistoryStateModule } from '@recipe-app-ngrx/router-history-state';

interface TestSchema {
  auth: AuthState;
}

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let store: Store<TestSchema>;
  let getLoginSpy: jasmine.Spy;
  let getLogoutSpy: jasmine.Spy;
  let getMatDialogOpenSpy: jasmine.Spy;
  let routerService: Router;

  const userTest = {
    _id: '',
    username: 'test_name',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  } as User;
  const errorMessage = 'ERROR: no access';

  describe('used in NgModule', () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'logout']);
    getLoginSpy = authServiceSpy.login;
    getLogoutSpy = authServiceSpy.logout;

    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    getMatDialogOpenSpy = matDialogSpy.open;

    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature('auth', authReducer, { initialState }),
          EffectsModule.forFeature([AuthEffects]),
          RouterTestingModule.withRoutes([
            { path: '**', component: PageNotFoundComponent }
          ])
        ],
        providers: [
          AuthFacade,
          { provide: AuthService, useValue: authServiceSpy},
          { provide: MatDialog, useValue: matDialogSpy }
        ],
        declarations: [ PageNotFoundComponent ]
      })
      class CustomFeatureModule {}

      @NgModule({
        imports: [
          NxModule.forRoot(),
          StoreModule.forRoot({}),
          EffectsModule.forRoot([]),
          CustomFeatureModule,
          StoreRouterConnectingModule,
          RouterHistoryStateModule
        ]
      })
      class RootModule {}
      TestBed.configureTestingModule({ imports: [RootModule] });

      store = TestBed.get(Store);
      facade = TestBed.get(AuthFacade);
    });

    it('login() should return user and state with prop loggedIn == true', async done => {
      try {
        let loggedIn = await readFirst(facade.loggedIn$);
        let user = await readFirst(facade.authencticatedUser$);
        let pending = await readFirst(facade.pending$);
        let error = await readFirst(facade.error$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy('there\'s no user');
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        getLoginSpy.and.returnValue(of(userTest));

        facade.login({username: 'test', password: ''});

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);

        expect(loggedIn).toBeTruthy('loggedIn=true');
        expect(user).toBeTruthy('there\'s user');
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    it('login() should return error', async done => {
      try {
        let loggedIn = await readFirst(facade.loggedIn$);
        let user = await readFirst(facade.authencticatedUser$);
        let pending = await readFirst(facade.pending$);
        let error = await readFirst(facade.error$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy('there\'s no user');
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        getLoginSpy.and.returnValue(throwError({ error: errorMessage}));

        facade.login({username: 'test', password: ''});

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy('there\'s no user');
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBe(errorMessage);

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    it(`loggout() should return initialState`, async done => {
      try {
        let loggedIn = await readFirst(facade.loggedIn$);
        let user = await readFirst(facade.authencticatedUser$);
        let pending = await readFirst(facade.pending$);
        let error = await readFirst(facade.error$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy('there\'s no user');
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        getLoginSpy.and.returnValue(of(userTest));

        facade.login({username: 'test', password: ''});

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);

        expect(loggedIn).toBeTruthy('loggedIn=true');
        expect(user).toBeTruthy('there\'s user');
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        const afterClosedMethod = () => of(true);
        getMatDialogOpenSpy.and.returnValue({afterClosed: afterClosedMethod});

        facade.logout();

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy('there\'s no user');
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    it(`should cancel loggout() and return user and state with prop loggedIn == true`, async done => {
      try {
        let loggedIn = await readFirst(facade.loggedIn$);
        let user = await readFirst(facade.authencticatedUser$);
        let pending = await readFirst(facade.pending$);
        let error = await readFirst(facade.error$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy('there\'s no user');
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        getLoginSpy.and.returnValue(of(userTest));

        facade.login({username: 'test', password: ''});

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);

        expect(loggedIn).toBeTruthy('loggedIn=true');
        expect(user).toBeTruthy('there\'s user');
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        const afterClosedMethod = () => of(false);
        getMatDialogOpenSpy.and.returnValue({afterClosed: afterClosedMethod});

        facade.logout();

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);

        expect(loggedIn).toBeTruthy('loggedIn=true');
        expect(user).toBeTruthy('there\'s user');
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    it(`loginRedirect() should call router.navigate(['/login'])`, () => {
      routerService = TestBed.get(Router);
      spyOn(routerService, 'navigate').and.callThrough();
      facade.loginRedirect();

      expect(routerService.navigate).toHaveBeenCalledWith(['/login']);
    });

    /**
     * Use `AuthLoaded` to manually submit list for state management
     */
    // it('allAuth$ should return the loaded list; and loaded flag == true', async done => {
    //   try {
    //     let list = await readFirst(facade.allAuth$);
    //     let isLoaded = await readFirst(facade.loaded$);

    //     expect(list.length).toBe(0);
    //     expect(isLoaded).toBe(false);

    //     store.dispatch(new AuthLoaded([createAuth('AAA'), createAuth('BBB')]));

    //     list = await readFirst(facade.allAuth$);
    //     isLoaded = await readFirst(facade.loaded$);

    //     expect(list.length).toBe(2);
    //     expect(isLoaded).toBe(true);

    //     done();
    //   } catch (err) {
    //     done.fail(err);
    //   }
    // });
  });
});

@Component({
  selector: 'rcp-page-not-found',
  template: '<p>test</p>'
})
class PageNotFoundComponent {

}
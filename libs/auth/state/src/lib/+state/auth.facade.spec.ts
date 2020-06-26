import { NgModule, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { readFirst } from '@nrwl/angular/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { StoreModule, Store } from '@ngrx/store';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';
import { Router } from '@angular/router';

import { NxModule } from '@nrwl/angular';

import { AuthEffects } from './auth.effects';
import { AuthFacade } from './auth.facade';

import { authQuery } from './auth.selectors';
import { Login, Logout } from './auth.actions';
import { AuthState, initialState, authReducer } from './auth.reducer';
import { AuthService } from '../services/auth.service';
import { User, SessionData } from '@recipe-app-ngrx/models';
import { RouterHistoryStateModule } from '@recipe-app-ngrx/router-history-state';
import { Session } from 'inspector';
import { UserFacade } from '@recipe-app-ngrx/user/state';

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
  const sessionData: SessionData = {
    userId: '5c18cb336a07d64bac65fddb',
    token: 'token',
    success: true
  }
  const errorMessage = 'ERROR: no access';

  describe('used in NgModule', () => {
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
          { provide: AuthService, useValue: authServiceSpy },
          { provide: MatDialog, useValue: matDialogSpy },
          { provide: UserFacade, useValue: userFacadeSpy }
        ],
        declarations: [PageNotFoundComponent]
      })
      class CustomFeatureModule {}

      @NgModule({
        imports: [
          NxModule.forRoot(),
          StoreModule.forRoot({}),
          EffectsModule.forRoot([]),
          CustomFeatureModule,
          StoreRouterConnectingModule.forRoot(),
          RouterHistoryStateModule
        ]
      })
      class RootModule {}
      TestBed.configureTestingModule({ imports: [RootModule] });

      store = TestBed.inject(Store);
      facade = TestBed.inject(AuthFacade);
    });

    it('login() should return session, user and state with prop loggedIn == true', async done => {
      try {
        let loggedIn = await readFirst(facade.loggedIn$);
        let user = await readFirst(facade.authencticatedUser$);
        let pending = await readFirst(facade.pending$);
        let error = await readFirst(facade.error$);
        let session = await readFirst(facade.session$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy("there's no user");
        expect(session).toBeFalsy(`there's no session`);
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        getLoginSpy.and.returnValue(of(sessionData));

        facade.login({ username: 'test', password: '' });

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);
        session = await readFirst(facade.session$);


        expect(loggedIn).toBeTruthy('loggedIn=true');
        // expect(user).toBeTruthy("there's user");
        expect(session).toBeTruthy(`there's session`);
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
        let session = await readFirst(facade.session$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy("there's no user");
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');
        expect(session).toBeFalsy(`there's no session`);

        getLoginSpy.and.returnValue(throwError({ error: errorMessage }));

        facade.login({ username: 'test', password: '' });

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);
        session = await readFirst(facade.session$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy("there's no user");
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBe(errorMessage);
        expect(session).toBeFalsy(`there's no session`);

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
        let session = await readFirst(facade.session$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy("there's no user");
        expect(session).toBeFalsy("there's no session");
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        getLoginSpy.and.returnValue(of(sessionData));

        facade.login({ username: 'test', password: '' });

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);
        session = await readFirst(facade.session$);

        expect(loggedIn).toBeTruthy('loggedIn=true');
        // expect(user).toBeTruthy("there's user");
        expect(session).toBeTruthy("there's session");
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        const afterClosedMethod = () => of(true);
        getMatDialogOpenSpy.and.returnValue({ afterClosed: afterClosedMethod });
        getLogoutSpy.and.returnValue(of(true));
        facade.logout();

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);
        session = await readFirst(facade.session$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy("there's no user");
        expect(session).toBeFalsy("there's no session");
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    it(`should cancel logout() and return session, user and state with prop loggedIn == true`, async done => {
      try {
        let loggedIn = await readFirst(facade.loggedIn$);
        let user = await readFirst(facade.authencticatedUser$);
        let pending = await readFirst(facade.pending$);
        let error = await readFirst(facade.error$);
        let session = await readFirst(facade.session$);

        expect(loggedIn).toBeFalsy('loggedIn=false');
        expect(user).toBeFalsy("there's no user");
        expect(session).toBeFalsy("there's no session");
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        getLoginSpy.and.returnValue(of(sessionData));

        facade.login({ username: 'test', password: '' });

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);
        session = await readFirst(facade.session$);

        expect(loggedIn).toBeTruthy('loggedIn=true');
        // expect(user).toBeTruthy("there's user");
        expect(session).toBeTruthy("there's session");
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        const afterClosedMethod = () => of(false);
        getMatDialogOpenSpy.and.returnValue({ afterClosed: afterClosedMethod });

        facade.logout();

        loggedIn = await readFirst(facade.loggedIn$);
        user = await readFirst(facade.authencticatedUser$);
        pending = await readFirst(facade.pending$);
        error = await readFirst(facade.error$);
        session = await readFirst(facade.session$);

        expect(loggedIn).toBeTruthy('loggedIn=true');
        // expect(user).toBeTruthy("there's user");
        expect(session).toBeTruthy("there's session");
        expect(pending).toBeFalsy('pending=false');
        expect(error).toBeFalsy('error=null');

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    it(`loginRedirect() should call router.navigate(['/login'])`, () => {
      routerService = TestBed.inject(Router);
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
class PageNotFoundComponent {}

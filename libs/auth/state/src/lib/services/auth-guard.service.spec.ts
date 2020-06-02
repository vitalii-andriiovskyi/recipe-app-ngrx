import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgModule, Component } from '@angular/core';
import { StoreModule, Store } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';

import { MatDialog } from '@angular/material/dialog';
import { NxModule } from '@nrwl/angular';

import { AuthGuard } from './auth-guard.service';
import { authReducer, initialState, AuthState } from '../+state/auth.reducer';
import { AuthEffects } from '../+state/auth.effects';
import { AuthFacade } from '../+state/auth.facade';
import { AuthService } from './auth.service';
import { RouterHistoryStateModule } from '@recipe-app-ngrx/router-history-state';
import { User } from '@recipe-app-ngrx/models';
import { cold } from 'jasmine-marbles';
import { LoginSuccess } from '../+state/auth.actions';

interface TestSchema {
  auth: AuthState;
}

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let store: Store<TestSchema>;

  const user = {
    _id: '',
    username: 'test_name',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  } as User;

  describe('used in NgModule', () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'logout'
    ]);
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

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
          { provide: MatDialog, useValue: matDialogSpy }
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
      authGuard = TestBed.inject(AuthGuard);
      store = TestBed.inject(Store);
    });

    it('should be created', () => {
      const service: AuthGuard = TestBed.inject(AuthGuard);
      expect(service).toBeTruthy();
    });

    it(`should return 'false' if the user isn't loggedIn`, () => {
      const expected = cold('(a|)', { a: false });

      expect(authGuard.canActivate()).toBeObservable(expected);
    });

    it(`should return 'true' if the user is loggedIn`, () => {
      store.dispatch(new LoginSuccess({ user }));

      const expected = cold('(a|)', { a: true });
      expect(authGuard.canActivate()).toBeObservable(expected);
    });
  });
});

@Component({
  selector: 'rcp-page-not-found',
  template: '<p>test</p>'
})
class PageNotFoundComponent {}

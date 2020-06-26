import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFirst } from '@nrwl/angular/testing';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';

import { NxModule } from '@nrwl/angular';

import { UserEffects } from './user.effects';
import { UserFacade } from './user.facade';

import * as UserSelectors from './user.selectors';
import * as UserActions from './user.actions';
import { USER_FEATURE_KEY, UserState, initialState, reducer } from './user.reducer';
import { User } from '@recipe-app-ngrx/models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from '../services';
import { SessionStorageService } from '@recipe-app-ngrx/utils';
import { of, BehaviorSubject } from 'rxjs';
import * as utils from '@recipe-app-ngrx/utils';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';

interface TestSchema {
  user: UserState;
}

describe('UserFacade', () => {
  let facade: UserFacade;
  let store: Store<TestSchema>;
  const userTest = {
    _id: '5c18cb336a07d64bac65fddb',
    username: 'test_name',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  } as User;
  const sessionData = {
    userId: '5c18cb336a07d64bac65fddb',
    token: 'token',
    success: true
  };

  let mockGetItem: jest.Mock, mockLoadUser: jest.Mock, mockLoginSucces: jest.Mock;
  const loggedIn$ = new BehaviorSubject<boolean>(false);
  beforeEach(() => {});

  describe('used in NgModule', () => {
    beforeEach(() => {
      mockGetItem = jest.fn();
      const mockSessionStorageService =  {
        getItem: mockGetItem
      }
      mockLoadUser = jest.fn();
      const mockUserService = {
        loadUser: mockLoadUser
      }

      mockLoginSucces = jest.fn();
      const mockAuthFacade = {
        loggedIn$: loggedIn$.asObservable(),
        loginSuccess: mockLoginSucces
      }

      @NgModule({
        imports: [
          StoreModule.forFeature(USER_FEATURE_KEY, reducer),
          EffectsModule.forFeature([UserEffects]),
          HttpClientTestingModule
        ],
        providers: [
          UserFacade,
          // UserService,
          // SessionStorageService
          { provide: UserService, useValue: mockUserService},
          { provide: SessionStorageService, useValue: mockSessionStorageService},
          { provide: AuthFacade, useValue: mockAuthFacade }
        ],
      })
      class CustomFeatureModule {}

      @NgModule({
        imports: [
          NxModule.forRoot(),
          StoreModule.forRoot({}),
          EffectsModule.forRoot([]),
          CustomFeatureModule,
        ],
      })
      class RootModule {}
      TestBed.configureTestingModule({ imports: [RootModule] });

      store = TestBed.inject(Store);
      facade = TestBed.inject(UserFacade);
    });

    /**
     * Use `loadUserSuccess` to manually update list
     */
    it('getUser$ should return the user', async (done) => {
      try {
        let result = await readFirst(facade.getUser$);

        expect(result).toBe(null);

        facade.dispatch(
          UserActions.loadUserSuccess({
            user: userTest,
          })
        );

        result = await readFirst(facade.getUser$);
        const { _id, username } = result;
        expect(_id).toBe(userTest._id);
        expect(username).toBe(userTest.username);

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    it(`loadUser() should dispatch LoadUser action; there's session data; success on the server`, async done => {
      try {
        let user = await readFirst(facade.getUser$);
        let loading = await readFirst(facade.loading$);
        let error = await readFirst(facade.error$);

        expect(user).toBeFalsy();
        expect(loading).toBeFalsy();
        expect(error).toBeFalsy();
        mockGetItem.mockImplementation(() => sessionData);
        mockLoadUser.mockReturnValue(of(userTest));
    
        facade.loadUser();

        user = await readFirst(facade.getUser$);
        loading = await readFirst(facade.loading$);
        error = await readFirst(facade.error$);

        expect(user).toBeTruthy();
        expect(loading).toBeFalsy();
        expect(error).toBeFalsy();

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    
  });
});

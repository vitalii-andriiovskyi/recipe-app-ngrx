import { TestBed, async } from '@angular/core/testing';

import { Observable, of, Subject, BehaviorSubject } from 'rxjs';

import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { NxModule } from '@nrwl/angular';
import { hot, cold } from '@nrwl/angular/testing';

import { UserEffects } from './user.effects';
import * as UserActions from './user.actions';
import { User } from '@recipe-app-ngrx/models';
import { SessionStorageService } from '@recipe-app-ngrx/utils';
import { UserService } from '../services';
import { AuthFacade } from '@recipe-app-ngrx/auth/state';
import { Store } from '@ngrx/store';
import { UserState } from './user.reducer';

interface TestSchema {
  user: UserState;
}

describe('UserEffects', () => {
  let store: Store<TestSchema>;
  let actions: Observable<any>;
  let effects: UserEffects;
  let authFacade: AuthFacade;
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
  }

  let mockGetItem: jest.Mock, mockLoadUser: jest.Mock, mockLoginSuccess: jest.Mock;
  const loggedIn$ = new BehaviorSubject<boolean>(false);


  beforeEach(() => {
    mockGetItem = jest.fn();
    const mockSessionStorageService =  {
      getItem: mockGetItem
    }
    mockLoadUser = jest.fn();
    const mockUserService = {
      loadUser: mockLoadUser
    }

    mockLoginSuccess = jest.fn();
    const mockAuthFacade = {
      loggedIn$: loggedIn$.asObservable(),
      loginSuccess: mockLoginSuccess
    }
    
    TestBed.configureTestingModule({
      imports: [NxModule.forRoot()],
      providers: [
        UserEffects,
        provideMockActions(() => actions),
        provideMockStore(),
        { provide: SessionStorageService, useValue: mockSessionStorageService },
        { provide: UserService, useValue: mockUserService },
        { provide: AuthFacade, useValue: mockAuthFacade }
      ],
    });

    effects = TestBed.inject(UserEffects);
    store = TestBed.inject(Store);
    authFacade = TestBed.inject(AuthFacade);
  });

  describe('loadUser$', () => {
    it('should return UserActions.loadUserSuccess action with loaded user: session has userId', () => {
      mockGetItem.mockReturnValue(sessionData);

      const action = UserActions.loadUser();
      const completion = UserActions.loadUserSuccess({ user: userTest });

      actions = hot('-a---', { a: action});
      const response = cold('-a|', { a: userTest });
      const expected = cold('--b', { b: completion });
      mockLoadUser.mockReturnValue(response);

      expect(effects.loadUser$).toBeObservable(expected);
    });

    it(`should return UserActions.loadUserFailure action in the case of error on the server: session has userId`, () => {
      mockGetItem.mockReturnValue(sessionData);
      const error = 'Unathorized 401';

      const action = UserActions.loadUser();
      const completion = UserActions.loadUserFailure({ error: error });

      actions = hot('-a---', { a: action});
      const response = cold('-#', {}, error);
      const expected = cold('--b', { b: completion });
      mockLoadUser.mockReturnValue(response);

      expect(effects.loadUser$).toBeObservable(expected);
    });

    it(`should return UserActions.loadUserFailure when there's no session data in SessionStorage`, () => {
      mockGetItem.mockReturnValue(null);
      const error = `Cannot get user's id`;

      const action = UserActions.loadUser();
      const completion = UserActions.loadUserFailure({ error: error });

      actions = hot('-a---', { a: action});
      const expected = cold('-b', { b: completion });
      // mockLoadUser.mockReturnValue(response);

      expect(effects.loadUser$).toBeObservable(expected);
    });
  });

  describe('loadUserSuccess$', () => {
    it(`should call the AuthFacade.loginSuccess with obj sessionData`, (done) => {
      expect.assertions(1);
      mockGetItem.mockReturnValue(sessionData);
      loggedIn$.next(false);
      
      const action = UserActions.loadUserSuccess({user: userTest})
      actions = of(action);
      effects.loadUserSuccess$.subscribe(() => {
        expect(mockLoginSuccess).toBeCalledWith(sessionData);
        done();
      })
    })
  });
});

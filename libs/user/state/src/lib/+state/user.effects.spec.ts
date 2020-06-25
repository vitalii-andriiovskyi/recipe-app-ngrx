import { TestBed, async } from '@angular/core/testing';

import { Observable, of } from 'rxjs';

import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { NxModule } from '@nrwl/angular';
import { hot, cold } from '@nrwl/angular/testing';

import { UserEffects } from './user.effects';
import * as UserActions from './user.actions';
import { User } from '@recipe-app-ngrx/models';
import { SessionStorageService } from '@recipe-app-ngrx/utils';
import { UserService } from '../services';

describe('UserEffects', () => {
  let actions: Observable<any>;
  let effects: UserEffects;
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

  let mockGetItem: jest.Mock, mockLoadUser: jest.Mock;

  beforeEach(() => {
    mockGetItem = jest.fn();
    const mockSessionStorageService =  {
      getItem: mockGetItem
    }
    mockLoadUser = jest.fn();
    const mockUserService = {
      loadUser: mockLoadUser
    }
   
    
    TestBed.configureTestingModule({
      imports: [NxModule.forRoot()],
      providers: [
        UserEffects,
        provideMockActions(() => actions),
        provideMockStore(),
        { provide: SessionStorageService, useValue: mockSessionStorageService },
        { provide: UserService, useValue: mockUserService }
      ],
    });

    effects = TestBed.inject(UserEffects);
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
});

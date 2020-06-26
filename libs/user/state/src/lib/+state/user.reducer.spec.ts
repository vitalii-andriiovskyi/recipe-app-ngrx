import * as UserActions from './user.actions';
import { UserState, initialState, reducer } from './user.reducer';
import { User } from '@recipe-app-ngrx/models';

describe('User Reducer', () => {
    const user = {
      _id: '5c18cb336a07d64bac65fddb',
      username: 'test_name',
      password: '',
      firstName: '',
      lastName: '',
      email: ''
    } as User;

  beforeEach(() => {});

  describe('valid User actions', () => {

    it('loadUser should return set pending to true', () => {
      const action = UserActions.loadUser();

      const result: UserState = reducer(initialState, action);

      expect(result.pending).toBeTruthy();
      expect(result.user).toBeFalsy();
      expect(result.error).toBeFalsy();
    });

    it('loadUserSuccess should return the User', () => {
      const action = UserActions.loadUserSuccess({ user });

      const result: UserState = reducer(initialState, action);

      expect(result.pending).toBeFalsy();
      expect(result.user._id).toBe(user._id);
      expect(result.error).toBeFalsy();
    });

    it('loadUserFailure should return error message', () => {
      const error = `401 Unauthorized`
      const action = UserActions.loadUserFailure({ error });

      const result: UserState = reducer(initialState, action);

      expect(result.pending).toBeFalsy();
      expect(result.user).toBeFalsy();
      expect(result.error).toBe(error);
    });


  });

  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});

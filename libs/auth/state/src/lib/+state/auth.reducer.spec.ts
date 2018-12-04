import { 
  Login,
  LoginSuccess,
  LoginFailure,
  LogoutConfirmation
} from './auth.actions';
import { AuthState, initialState, authReducer } from './auth.reducer';
import { User, AuthUserVW } from '../models/user';

describe('AuthReducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = authReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('LOGIN', () => {
    it('should make \'pending\' state true', () => {
      const user = { username: 'test' } as AuthUserVW;
      const createAction = new Login({ authUser: user });

      const result = authReducer(initialState, createAction);

      expect(result.pending).toBeTruthy('pending is true');
      expect(result.loggedIn).toBeFalsy('is not logged');
      expect(result.error).toBeFalsy('no error');
      expect(result.user).toBeFalsy('no user');
    });
  });

  describe('LOGIN_SUCCESS', () => {
    it('should add a user, set \'loggedIn\' to true, and have no error and no \'pending\' state', () => {
      const user = {
        _id: '',
        username: 'test_name',
        password: '',
        firstName: '',
        lastName: '',
        email: ''
      } as User;

      const createAction = new LoginSuccess({ user });

      const result = authReducer(initialState, createAction);

      expect(result.loggedIn).toBeTruthy('state.loggedIn = true');
      expect(result.user.username).toBe('test_name');
      expect(result.pending).toBeFalsy('pending is false');
      expect(result.error).toBeFalsy('no error');
    });
  });

  describe('LOGIN_FAILURE', () => {
    it('should have an error and no \'pending\' state', () => {
      const error = 'login failed';
      const createAction = new LoginFailure({ error });

      const result = authReducer(initialState, createAction);

      expect(result.loggedIn).toBeFalsy('state.loggedIn = false');
      expect(result.user).toBeFalsy('there\'s no user');
      expect(result.pending).toBeFalsy('pending is false');
      expect(result.error).toBe('login failed');
    });
  });

  describe('LOGOUT_CONFIRMATION', () => {
    it('should logout a user', () => {
      const user = {
        _id: '',
        username: 'test_name',
        password: '',
        firstName: '',
        lastName: '',
        email: ''
      } as User;

      const createActionSuccess = new LoginSuccess({ user });
      const resultSuccess = authReducer(initialState, createActionSuccess);

      expect(resultSuccess.loggedIn).toBeTruthy('state.loggedIn = true');
      expect(resultSuccess.user.username).toBe('test_name');
      expect(resultSuccess.pending).toBeFalsy('pending is false');
      expect(resultSuccess.error).toBeFalsy('no error');

      const createAction = new LogoutConfirmation();
      const result = authReducer(resultSuccess, createAction);

      expect(result.loggedIn).toBeFalsy('user is logged out');
      expect(result.user).toBeFalsy('user is null');
      expect(result.pending).toBeFalsy('pending is false');
      expect(result.error).toBeFalsy('no error');
    });
  });
});

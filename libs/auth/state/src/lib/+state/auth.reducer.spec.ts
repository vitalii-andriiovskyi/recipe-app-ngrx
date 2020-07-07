import { 
  Login,
  LoginSuccess,
  LoginFailure,
  LogoutConfirmation
} from './auth.actions';
import { AuthState, initialState, authReducer } from './auth.reducer';
import { User, AuthUserVW, SessionData } from '@recipe-app-ngrx/models';

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
      const sessionData: SessionData = {
        userId: '5c18cb336a07d64bac65fddb',
        token: 'token',
        success: true
      }

      const createAction = new LoginSuccess({ session: sessionData });

      const result = authReducer(initialState, createAction);
      const { loggedIn, session: { userId }, pending, error } = result;

      expect(loggedIn).toBeTruthy('state.loggedIn = true');
      expect(userId).toBe(sessionData.userId);
      expect(pending).toBeFalsy('pending is false');
      expect(error).toBeFalsy('no error');
    });
  });

  describe('LOGIN_FAILURE', () => {
    it('should have an error and no \'pending\' state', () => {
      const error = 'login failed';
      const createAction = new LoginFailure({ error });

      const result = authReducer(initialState, createAction);
      
      expect(result.loggedIn).toBeFalsy('state.loggedIn = false');
      expect(result.session).toBeFalsy('there\'s no session');
      expect(result.pending).toBeFalsy('pending is false');
      expect(result.error).toBe('login failed');
    });
  });

  describe('LOGOUT_CONFIRMATION', () => {
    it('should logout a user', () => {
      const sessionData: SessionData = {
        userId: '5c18cb336a07d64bac65fddb',
        token: 'token',
        success: true
      }

      const createActionSuccess = new LoginSuccess({ session: sessionData });
      const resultSuccess = authReducer(initialState, createActionSuccess);
      const { loggedIn, session: { userId }, pending, error } = resultSuccess;


      expect(loggedIn).toBeTruthy('state.loggedIn = true');
      expect(userId).toBe(sessionData.userId);
      expect(pending).toBeFalsy('pending is false');
      expect(error).toBeFalsy('no error');

      const createAction = new LogoutConfirmation();
      const result = authReducer(resultSuccess, createAction);

      expect(result.loggedIn).toBeFalsy('user is logged out');
      expect(result.session).toBeFalsy('session is closed');
      expect(result.pending).toBeFalsy('pending is false');
      expect(result.error).toBeFalsy('no error');
    });
  });
});

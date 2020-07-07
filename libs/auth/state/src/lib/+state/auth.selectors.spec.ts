import { AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import { SessionData } from '@recipe-app-ngrx/models';

describe('Auth Selectors', () => {
  const ERROR_MSG = 'No Error Available';

  let storeState: { auth: AuthState };

  beforeEach(() => {
    storeState = {
      auth: {
        loggedIn: true,
        user: {
          _id: '',
          username: 'test_name',
          password: '',
          firstName: '',
          lastName: '',
          email: ''
        },
        pending: true,
        error: ERROR_MSG,
        session: {
          userId: '5c18cb336a07d64bac65fddb',
          token: 'token',
          success: true
        }
      }
    };
  });
  
  describe('Auth Selectors', () => {
    it('getUser() should return the user of Auth', () => {
      const user = authQuery.getUser(storeState);

      expect(user['username']).toBe('test_name');
    });

    it('getLoggedIn() should return the current \'loggedIn\' storeState', () => {
      const loggedIn = authQuery.getLoggedIn(storeState);

      expect(loggedIn).toBeTruthy('is logged');
    });

    it("getAuthError() should return the current 'error' storeState", () => {
      const error = authQuery.getAuthError(storeState);

      expect(error).toBe(ERROR_MSG, ERROR_MSG);
    });

    it("getAuthPending() should return the current 'error' storeState", () => {
      const pending = authQuery.getAuthPending(storeState);

      expect(pending).toBeTruthy('is pending');
    });
    it("getSession() should return the session data", () => {
      const session = authQuery.getSession(storeState) as SessionData;
      const { userId, token } = session;

      expect(userId).toBe(storeState.auth.session.userId);
      expect(token).toBe(storeState.auth.session.token);
    });
  });
});

import { UserPartialState } from './user.reducer';
import * as UserSelectors from './user.selectors';
import { User } from '@recipe-app-ngrx/models';

describe('User Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const user = {
    _id: '5c18cb336a07d64bac65fddb',
    username: 'test_name',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  } as User;

  let state: UserPartialState;

  beforeEach(() => {
    state = {
      user: {
        user,
        pending: true,
        error: ERROR_MSG
      }
    };
  });

  describe('User Selectors', () => {
    it('getUser() should return the User', () => {
      const result = UserSelectors.getUser(state);
      const { _id, username } = result;

      expect(_id).toBe(user._id);
      expect(username).toBe(user.username);
    });

    it('getUserLoading() should return true', () => {
      const result = UserSelectors.getUserLoading(state);

      expect(result).toBeTruthy();
    });

    it("getUserError() should return the current 'error' state", () => {
      const result = UserSelectors.getUserError(state);

      expect(result).toBe(ERROR_MSG);
    });
  });
});


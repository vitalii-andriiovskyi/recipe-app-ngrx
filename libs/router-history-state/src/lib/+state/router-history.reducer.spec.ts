import { RouterHistoryUpdated } from './router-history.actions';
import {
  RouterHistoryState,
  initialState,
  routerHistoryReducer
} from './router-history.reducer';
import { RouterStateUrl } from '@recipe-app-ngrx/utils';

describe('RouterHistory Reducer', () => {
  let updatedRouter: RouterStateUrl; 

  describe('valid RouterHistory actions ', () => {
    it(`should return updated 'currentRouter' and 'previousRouter' of RouterHistoryState`, () => {
      updatedRouter = {
        url: '/recipe/100?cat=desserts',
        params: {
          id: '100'
        },
        queryParams: {
          cat: 'desserts'
        }
      }
      let action = new RouterHistoryUpdated(updatedRouter);
      const result: RouterHistoryState = routerHistoryReducer(
        initialState,
        action
      );

      expect(result.currentRouter.url).toBe(updatedRouter.url);
      expect(result.currentRouter.params).toBe(updatedRouter.params);
      expect(result.currentRouter.queryParams).toBe(updatedRouter.queryParams);
      expect(result.previousRouter.url).toBe(initialState.currentRouter.url);
      expect(result.previousRouter.params).toBe(initialState.currentRouter.params);
      expect(result.previousRouter.queryParams).toBe(initialState.currentRouter.queryParams);

      const oldRouterHistoryState = result;
      updatedRouter = {
        url: '/recipes/salads',
        params: {
          id: 'salads'
        },
        queryParams: { }
      }
      action = new RouterHistoryUpdated(updatedRouter);
      const result2: RouterHistoryState = routerHistoryReducer(
        oldRouterHistoryState,
        action
      );

      expect(result2.currentRouter.url).toBe(updatedRouter.url);
      expect(result2.currentRouter.params).toBe(updatedRouter.params);
      expect(result2.currentRouter.queryParams).toBe(updatedRouter.queryParams);
      expect(result2.previousRouter.url).toBe(oldRouterHistoryState.currentRouter.url);
      expect(result2.previousRouter.params).toBe(oldRouterHistoryState.currentRouter.params);
      expect(result2.previousRouter.queryParams).toBe(oldRouterHistoryState.currentRouter.queryParams);
    });
  });

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = routerHistoryReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});

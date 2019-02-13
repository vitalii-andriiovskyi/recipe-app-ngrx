import { RouterHistoryState } from './router-history.reducer';
import { routerHistoryQuery } from './router-history.selectors';

describe('RouterHistory Selectors', () => {
  const storeState = {
    routerHistory: {
      previousRouter: {
        url: '/recipes/salads',
        params: {
          id: 'salads'
        },
        queryParams: { }
      },
      currentRouter: {
        url: '/recipe/100?cat=desserts',
        params: {
          id: '100'
        },
        queryParams: {
          cat: 'desserts'
        }
      }
    }
  };

  describe('RouterHistory Selectors', () => {
    it('getPreviousRouter() should return the previous Router', () => {
      const results = routerHistoryQuery.getPreviousRouter(storeState);

      expect(results.url).toBe(storeState.routerHistory.previousRouter.url);
      expect(results.params.id).toBe(storeState.routerHistory.previousRouter.params.id);
      expect(results.queryParams).toBe(storeState.routerHistory.previousRouter.queryParams);
    });

    it('getCurrentRouter() should return the current Router', () => {
      const results = routerHistoryQuery.getCurrentRouter(storeState);

      expect(results.url).toBe(storeState.routerHistory.currentRouter.url);
      expect(results.params.id).toBe(storeState.routerHistory.currentRouter.params.id);
      expect(results.queryParams).toBe(storeState.routerHistory.currentRouter.queryParams);
    });

  });
});

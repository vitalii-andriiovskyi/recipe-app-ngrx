import { sendHttpError } from './sendHttpError';

describe('sendHttpError', () => {
  const req: any = {};
  const res: any = {
    req: {
      headers: {
        'x-requested-with':  ''
      }
    },
    json: arg => arg
  };
  const next = (arg?) => 'callback worked';

  describe(`add 'sendHttpError' to 'res'`, () => {
    it(`should add set the 'sendHttpError' prop into 'res'`, () => {
      sendHttpError(req, res, next);

      expect(res.hasOwnProperty('sendHttpError')).toBeTruthy();
      expect(typeof res.sendHttpError === 'function').toBeTruthy();
    });
  });

  describe('sendHttpError in action', () => {
    const error = {
      status: 400,
      message: 'error'
    }

    beforeEach(() => {
      spyOn(res, 'json').and.callThrough();
    });

    it(`should call 'json' method when 'XMLHttpRequest' is made`, () => {
      res.req.headers['x-requested-with'] = 'XMLHttpRequest';
      sendHttpError(req, res, next);

      res.sendHttpError(error);
      expect(res.json).toHaveBeenCalledWith(error);
    });

    it('should call the method \'next\' when \'XMLHttpRequest\' isn\'t made', () => {
      res.req.headers['x-requested-with'] = '';
      const mockNext = jest.fn(x => 'callback worked');
      sendHttpError(req, res, mockNext);

      res.sendHttpError(error);
      expect(mockNext.mock.calls.length).toBe(2);
    });
  });
});
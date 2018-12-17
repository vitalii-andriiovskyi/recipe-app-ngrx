import { expressErrorHandler } from './expressErrorHandler';
import { HTTP_ERROR_TYPE, HttpError } from '../utils/error';

describe(`expressErrorHandler`, () => {
  let env = '';
  const req: any = {
    app: {
      get: (arg: string) => env
    }
  };
  const res: any = {
    locals: {
      message: '',
      error: {}
    },
    sendHttpError: jest.fn(x => x)
  };
  const mockNext = jest.fn(x => 'callback worked');

  const err = new HttpError(400, 'error');

  beforeEach(() => {
    res.sendHttpError = jest.fn(x => x);
  });

  it(`should call res.sendHttpError when an error is a number`, () => {
    env = 'development';

    expressErrorHandler(400, req, res, mockNext);
    
    expect(res.sendHttpError.mock.calls.length).toBe(1);

    const typeOfError = res.sendHttpError.mock.results[0].value;
    expect(typeOfError.type).toBe(HTTP_ERROR_TYPE);
    expect(res.locals.error['type']).toBe(HTTP_ERROR_TYPE);
  });

  it(`should call res.sendHttpError when an error is a instance of HttpError`, () => {
    env = 'development';

    expressErrorHandler(err, req, res, mockNext);
    
    expect(res.sendHttpError.mock.calls.length).toBe(1);

    const typeOfError = res.sendHttpError.mock.results[0].value;
    expect(typeOfError.type).toBe(HTTP_ERROR_TYPE);
    expect(res.locals.error['type']).toBe(HTTP_ERROR_TYPE);
  });

  it(`should call 'res.sendHttpError(err)' and return err 500 when mode is not 'development' and the error isn't an instance of HttpError`, () => {
    env = 'production';
    const someErr = {
      type: 'some',
      status: 500,
      message: 'error'
    }

    expressErrorHandler(someErr, req, res, mockNext);
    
    expect(res.sendHttpError.mock.calls.length).toBe(1);

    const typeOfError = res.sendHttpError.mock.results[0].value;
    expect(typeOfError.type).toBe(HTTP_ERROR_TYPE);
    expect(typeOfError.status).toBe(500);
  });

  it(`should call next(err) when mode is 'development' and the error isn't an instance of HttpError`, () => {
    env = 'development';
    const someErr = {
      type: 'some',
      status: 500,
      message: 'error'
    }
    expressErrorHandler(someErr, req, res, mockNext);
    
    expect(mockNext.mock.calls.length).toBe(1);
    
    const result = mockNext.mock.results[0].value;
    expect(result).toBe('callback worked');
  });

});

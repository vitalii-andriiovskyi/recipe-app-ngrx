const http = require('http');

export const HTTP_ERROR_TYPE = 'customHttpError';

export class HttpError extends Error {
  status: number;
  // I added the prop 'type' in order to solve the issue with instanceof. There's workaround but it's also has problems
  // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
  constructor(status: number, message?: string, public type = HTTP_ERROR_TYPE) {
    super();
    this.status = status;
    this.message = message || http.STATUS_CODES[status] || 'Error';

    Error.captureStackTrace(this, HttpError);
  }
}

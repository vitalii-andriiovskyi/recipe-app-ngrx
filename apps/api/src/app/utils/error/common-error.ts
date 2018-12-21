export enum CommonErrorTypes {
  CommonError = 'CommonError',
  AuthError = 'AuthError',
  CreationError = 'CreationError',
  DeletionError = 'DeletionError'
}

export class CommonError extends Error {

  // I added the prop 'type' in order to solve the issue with instanceof. There's workaround but it's also has problems
  // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
  constructor(message: string, public type = CommonErrorTypes.CommonError) {
    super(message);
    
    Error.captureStackTrace(this, CommonError);
  }
}

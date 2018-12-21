import { Injectable, ErrorHandler, InjectionToken, Inject } from '@angular/core';


export const ENV_RCP: any = new InjectionToken<any>('envinroment');

/**
 * To use LogService in providers of any module, provide 'InjectionToken' 'ENV_RCP',
 * which must be envinroment variable, and ErrorHandler
 * 
 * @usageNotes
 * ### Example
 * 
 * ```
 * import { environment } from '../environments/environment';
 * import { ErrorHandler } from '@angular/core';
 * import { ENV_RCP, LogService } from '@recipe-app-ngrx/utils'; 
 * 
 * @NgModule({
 *   providers: [
 *    { provide: ENV_RCP, useValue: envinroment },
 *    LogService,
 *    ErrorHandler
 *  ]
 * })
 * class MyModule {}
 * ```
 */
@Injectable()
export class LogService {

  constructor(private errorHandler: ErrorHandler, @Inject(ENV_RCP) public env: any) {}

  log(value: any, ...rest: any[]) {
    if (!this.env.production) {
      console.log(value, ...rest);
    }
  }

  error(error: Error) {
    this.errorHandler.handleError(error);
  }

  warn(value: any, ...rest: any[]) {
    console.warn(value, ...rest);
  }
}

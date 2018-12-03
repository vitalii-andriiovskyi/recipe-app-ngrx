import { TestBed } from '@angular/core/testing';
import { ErrorHandler } from '@angular/core';
import { LogService, ENV_RCP } from './log.service';

describe('LogService', () => {
  let logSpy: jasmine.Spy;
  let warnSpy: jasmine.Spy;
  let logger: LogService;
  let errorHandler: ErrorHandler;
  const env: any = {
    production: false
  }

  beforeEach(() => {
    logSpy = spyOn(console, 'log');
    warnSpy = spyOn(console, 'warn');

    TestBed.configureTestingModule({
      providers: [
        { provide: ENV_RCP, useValue: env },
        { provide: ErrorHandler, useClass: MockErrorHandler },
        LogService
      ]
    });

    logger = TestBed.get(LogService);
    errorHandler = TestBed.get(ErrorHandler);

  });

  describe('log', () => {
    it('should delegate to console.log', () => {
      logger.log('param1', 'param2', 'param3');
      expect(logSpy).toHaveBeenCalledWith('param1', 'param2', 'param3');
    });
  });

  describe('warn', () => {
    it('should delegate to console.warn', () => {
      logger.warn('param1', 'param2', 'param3');
      expect(warnSpy).toHaveBeenCalledWith('param1', 'param2', 'param3');
    });
  });

  describe('error', () => {
    it('should delegate to ErrorHandler', () => {
      const err = new Error('some error message');
      logger.error(err);
      expect(errorHandler.handleError).toHaveBeenCalledWith(err);
    });
  });
});

class MockErrorHandler implements ErrorHandler {
  handleError = jasmine.createSpy('handleError');
}
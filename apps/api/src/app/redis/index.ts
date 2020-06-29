const redis = require('redis');
import { RedisClient } from 'redis';
import { Response } from 'express';
import getLogger from '../utils/logger';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonError, CommonErrorTypes } from '../utils/error';
import { SessionData } from '@recipe-app-ngrx/models';

export type StrCallback = (err: Error | null, res: string) => Response<SessionData>;

const logger = getLogger(module);
export const redisClient: RedisClient = redis.createClient(process.env.REDIS_URI);

redisClient.on("error", function(error) {
  logger.error(error);
});

export const setToken = (key: string, value: string): Observable<any> => {
  return of(redisClient.set(key, value)).pipe(
    switchMap(res => {
      if (res) {
        return of({token: key, userId: value})
      }
      logger.error(`didn't set token`);
      return throwError(new CommonError(`Didn't set token`, CommonErrorTypes.SetTokenError))
    })
  );
}

export const getToken = (key: string, func?: StrCallback): boolean => {
  return redisClient.get(key, func);
}

export const removeToken = (token: string): Observable<boolean> => {
  return of(redisClient.del(token));
}
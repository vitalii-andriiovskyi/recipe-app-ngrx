import { NextFunction, Response, Request, Router } from "express";
import { UserModel } from '../models/user';
import { CommonErrorTypes } from '../utils/error';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { StrCallback, getToken, setToken } from '../redis';
import { createJWT } from '../utils';
import { SessionData } from '@recipe-app-ngrx/models';

export class UsersApi {

  public static create(router: Router) {
    router.post('/users/create', (req: Request, res: Response, next: NextFunction) => {
      new UsersApi().create(req, res, next);
    });

    router.post('/users/authenticate', (req: Request, res: Response, next: NextFunction) => {
      new UsersApi().authenticate(req, res, next);
    });

    router.delete('/users/:id', (req: Request, res: Response, next: NextFunction) => {
      new UsersApi().delete(req, res, next);
    });
    router.get('/users/:id', (req: Request, res: Response, next: NextFunction) => {
      new UsersApi().get(req, res, next);
    });

  }

  public get(req: Request, res: Response, next: NextFunction) {
    const PARAM_ID = 'id';
    if (req.params[PARAM_ID] === undefined) {
      res.sendStatus(404);
      next();
      return;
    }

    const id: string = req.params[PARAM_ID];

    UserModel.getUser(id).subscribe(
      user => {
        res.json(user);
        next();
      },
      err => {
        if (err.type && err.type === CommonErrorTypes.GettingError) {
          res.status(403).send(err.message);
        } else {
          return next(err); // ???????? don't know whether is it right
        }
        next();
      }
    );
  }

  public create(req: Request, res: Response, next: NextFunction) {

    // const userN = {
    //   username: 'rcp_user',
    //   password: '1111',
    //   firstName: 'rcp_user',
    //   lastName: 'rcp_user',
    //   email: 'domovik0712@gmail.com',
    //   address: {
    //     street: 'string',
    //     city: 'string',
    //     state: 'string',
    //     zip: 'string',
    //   },
    //   phone: '+ 380',
    // }
    // UserModel.createUser(userN).subscribe(
    UserModel.createUser(req.body)
      .pipe(
        switchMap(user => this.createSession(user))
      )
      .subscribe(
        (successAuth: SessionData | string) => {
          res.json(successAuth);
          next();
        },
        err => {
          if (err.type && err.type === CommonErrorTypes.CreationError) {
            res.status(403).send(err.message);
          } else {
            return next(err); // ???????? don't know whether it is right
          }
          next();
        }
    );
  }

  public authenticate(req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body;
    const { authorization } = req.headers;

    return authorization ? this.getAuthTokenId(req, res) : UserModel.authenticate(username, password)
      .pipe(
        switchMap(user => this.createSession(user))
      )
      .subscribe(
        (successAuth: SessionData | string) => {
          res.json(successAuth);
          next();
        },
        err => {
          if (err.type && (err.type === CommonErrorTypes.AuthError || err.type === CommonErrorTypes.CommonError)) {
            res.status(401).send(err.message);
          } else {
            return next(err); // ???????? don't know whether it is right
          }
          next();
        }
      );
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    const PARAM_ID = 'id';
    if (req.params[PARAM_ID] === undefined) {
      res.sendStatus(404);
      next();
      return;
    }

    const id: string = req.params[PARAM_ID];
    UserModel.removeUser(id).subscribe(
      () => {
        res.sendStatus(200);
        next();
      },
      err => {
        if (err.type && err.type === CommonErrorTypes.DeletionError) {
          res.status(403).send(err.message);
        } else {
          return next(err); // ???????? don't know whether it is right
        }
        next();
      }
    );
  }

  getAuthTokenId(req: Request, res: Response): boolean {
    const { authorization } = req.headers;
    const authToken = authorization.split(' ')[1];
    return getToken(authToken, this.getTokenCallback(authToken, res));
  }

  getTokenCallback = (token: string, res: Response): StrCallback => (err, reply) => {
    if (err || !reply) {
      return res.status(400).send('Unauthorized');
    }
    return res.json({userId: reply, success: true, token: token});
  }

  createSession({_id, username}): Observable<SessionData | string> {
    
    return setToken( createJWT(username), `${_id}`).pipe(
      map((res): SessionData => ({ success: true, ...res })),
      catchError((err): string | Observable<never> => {
        if (err.type && (err.type === CommonErrorTypes.SetTokenError)) {
          console.log(err.message);
          return err.message;
        }
        return throwError(err);
      })
    )
  }

}
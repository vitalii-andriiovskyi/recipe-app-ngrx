import { NextFunction, Response, Request, Router } from "express";
import { UserModel } from '../models/user';
import { CommonErrorTypes, HttpError } from "../utils/error";

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
    UserModel.createUser(req.body).subscribe(
      user => {
        res.json(user);
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
    UserModel.authenticate(req.body.username, req.body.password).subscribe(
      user => {
        res.json(user);
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

}
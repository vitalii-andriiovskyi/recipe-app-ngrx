import { Request, Response, NextFunction } from 'express';

export const sendHttpError = (req: Request, res: Response, next: NextFunction) => {
  res['sendHttpError'] = error => {
    res.status = error.status;
    // if there is ajax request then res.json() else ...
    if (res.req.headers['x-requested-with'] === 'XMLHttpRequest') {
      res.json(error);
    } else {
      // res.render('error', { error: error });
      next(error);
    }
  };
  next();
};

import { HttpError, HTTP_ERROR_TYPE } from '../utils/error';
import getLogger from '../utils/logger';

const logger = getLogger(module);

export const expressErrorHandler = (err, req, res, next) => {
  if (typeof err === 'number') {
    err = new HttpError(err);
  }
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.type === HTTP_ERROR_TYPE) {
    res.sendHttpError(err);
  } else {
    if (req.app.get('env') === 'development') {
      next(err);
    } else {
      logger.error(err);
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
}

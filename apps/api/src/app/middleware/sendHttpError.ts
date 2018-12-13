export const sendHttpError = (req, res, next) => {
  res.sendHttpError = error => {
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

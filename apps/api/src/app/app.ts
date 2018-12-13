import * as express from 'express';
import getLogger from './utils/logger';
import { sendHttpError } from './middleware/sendHttpError';
import { expressErrorHandler } from './middleware/expressErrorHandler';

const app = express();

const logger = getLogger(module);
logger.debug(`Overriding 'Express' logger`);
app.use( require('morgan')('combined', { 'stream': logger.stream }) );

app.use(sendHttpError);

app.get('/', (req, res, next) => {
  res.json('Hello');
});

app.use(expressErrorHandler);

const errorhandler = require('errorhandler');
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler());
}

export = app;
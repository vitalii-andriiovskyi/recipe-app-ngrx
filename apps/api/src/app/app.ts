import * as express from 'express';
import getLogger from './utils/logger';
import { sendHttpError } from './middleware/sendHttpError';
import { expressErrorHandler } from './middleware/expressErrorHandler';
import { join } from 'path';
import * as config from './config';

const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressJwt = require('express-jwt');

const DIST_FOLDER = join(process.cwd(), 'dist');

const app = express();

const logger = getLogger(module);
logger.debug(`Overriding 'Express' logger`);
app.use( require('morgan')('combined', { 'stream': logger.stream }) );

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// use JWT auth to secure the api, the token can be passed in the authorization header or querystring
app.use(expressJwt({
  secret: config.get('secret'),
  getToken: function (req) {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
          return req.headers.authorization.split(' ')[1];
      } else if (req.query && req.query.token) {
          return req.query.token;
      }
      return null;
  }
}).unless({ path: ['/api/users/authenticate', '/'] }));

app.use(sendHttpError);

// ----------------------------------------------------------------------

app.get('/', (req, res, next) => {
  res.json('Hello');
});

app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// ----------------------------------------------------------------------

app.use(expressErrorHandler);

const errorhandler = require('errorhandler');
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler());
}

export = app;
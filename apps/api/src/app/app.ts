import * as express from 'express';
import { join } from 'path';
import * as config from './config';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as expressJwt from 'express-jwt';
import * as morgan from 'morgan';

import getLogger from './utils/logger';
import { sendHttpError } from './middleware/sendHttpError';
import { expressErrorHandler } from './middleware/expressErrorHandler';

const DIST_FOLDER = join(process.cwd(), 'dist');

const logger = getLogger(module);

export class ExpressServer {

  /**
   * The express application.
   */
  public app: express.Application;

  /**
   * Bootstrap the application.
   */
  public static bootstrap(): ExpressServer {
    return new ExpressServer();
  }

  constructor() {
    //create expressjs application
    this.app = express();

    //configure application
    this.config();

    //add api
    this.api();
  }

  /**
   * REST API endpoints.
   */
  public api() {
    const router = express.Router();

    // root request
    router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.json({ announcement: "Welcome to our API." });
      next();
    });

    // create API routes
    // HerosApi.create(router);

    // wire up the REST API
    this.app.use("/api", router);

    // enable CORS pre-flight
    // router.options("*", cors(corsOptions));
  }

  /**
   * Configure application
   *
   * @class Server
   */
  public config() {
    logger.debug(`Overriding 'Express' logger`);
    this.app.use( morgan('combined', { 'stream': logger.stream }) );

    this.app.use(cors());
    this.app.use(cookieParser());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());

    // use JWT auth to secure the api, the token can be passed in the authorization header or querystring
    this.app.use(expressJwt({
      secret: config.get('secret'),
      getToken: function (req: express.Request) {
        const headerAuth = req.headers.authorization as string;

        if (headerAuth && headerAuth.split(' ')[0] === 'Bearer') {
            return headerAuth.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
      }
    }).unless({ path: ['/api/users/authenticate', '/api'] }));

    this.app.use(sendHttpError);

    // connect to mongoose
    // mongoose.connect("mongodb://localhost:27017/mean-material-reactive");
    // mongoose.connection.on("error", error => {
    //   console.error(error);
    // });

    this.app.use(expressErrorHandler);

    //catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      err.status = 404;
      next(err);
    });

    const errorHandler = require('errorhandler');
    if (process.env.NODE_ENV === 'development') {
      // only use in development
      this.app.use(errorHandler());
    }
  }
}

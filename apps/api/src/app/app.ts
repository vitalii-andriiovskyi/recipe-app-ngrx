import * as express from 'express';
import getLogger from './utils/logger';

const app = express();

const logger = getLogger(module);
logger.debug(`Overriding 'Express' logger`);
app.use( require('morgan')('combined', { 'stream': logger.stream }) );

app.get('/', (req, res) => {
  res.send(`Welcome to api!`);
});

export = app;
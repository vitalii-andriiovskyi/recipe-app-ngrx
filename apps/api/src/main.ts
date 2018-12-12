import * as app from './app/app';
import * as config from './app/config';
import getLogger from './app/utils/logger';
import { join } from 'path';

const logger = getLogger(module);

const PORT = config.get('port');
const HOSTNAME =  process.env.NODE_ENV === 'production' ? config.get('hostname') : 'localhost';
const DIST_FOLDER = join(process.cwd(), 'dist');

app.listen(PORT, (err) => {
  if (err) { 
    logger.error(err);
  }
  logger.info(`Node server is listening on http://${HOSTNAME}:${PORT}`);
});

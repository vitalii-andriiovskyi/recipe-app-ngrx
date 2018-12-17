import { ExpressServer as server } from './app/app';
import * as config from './app/config';
import getLogger from './app/utils/logger';

const logger = getLogger(module);

const PORT = config.get('port');
const HOSTNAME =  process.env.NODE_ENV === 'production' ? config.get('hostname') : 'localhost';

const app = server.bootstrap().app;
app.listen(PORT, (err) => {
  if (err) { 
    logger.error(err);
  }
  logger.info(`Node server is listening on http://${HOSTNAME}:${PORT}`);
});

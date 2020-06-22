import { ExpressServer as server } from './app/app';
import * as mongoose from 'mongoose';
import config from './app/config';
import getLogger from './app/utils/logger';

const logger = getLogger(module);

const PORT = config.get('port');
const HOSTNAME =  process.env.NODE_ENV === 'production' ? config.get('hostname') : 'localhost';

// connect to mongoose
// mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'), (data) => {
mongoose.connect(process.env.MONGODB_URI, config.get('mongoose:options'), (data) => {
  logger.info('Connected to MongoDB');
});
mongoose.connection.on("error", error => {
  logger.error(error);
});

export const app = server.bootstrap().app;
app.listen(PORT, (err: any) => {
  if (err) { 
    logger.error(err);
  }
  logger.info(`Node server is listening on http://${HOSTNAME}:${PORT}`);
});

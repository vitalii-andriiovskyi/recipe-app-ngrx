const nconf = require('nconf');
import { join } from 'path';

nconf.argv()
  .env()
  .file({file: join(__dirname, 'config.json')} );

export = nconf;

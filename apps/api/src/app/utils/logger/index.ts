// import { createLogger, format, transports } from 'winston';
// I can't use the line above because creators of 'winston' didn't write types for imported objects and 
// Typescript compiler shows errors during compiling the code into javascript
// Hovewer, the code gets transpiled into javascript and everything works well

// The line below allows to avoid the errors described above.   
const { createLogger, format, transports } = require('winston');
const { combine, colorize, label, json, timestamp, printf } = format;
require('winston-daily-rotate-file');
const fs = require('fs');
import { join } from 'path';

const ENV = process.env.NODE_ENV;
const logDir = join(__dirname, 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: `${logDir}/%DATE%-results.log`,
  datePattern: 'YYYY-MM-DD'
});

function getLogger(module) {
  let path = '';

  // 'module.i' works for this project. What about the others I don't know
  if (module.i) {
    path = module.i;
  }

  const logger = createLogger({
    transports: [
      new transports.Console({
        level: ENV === 'development' ? 'debug' : 'error',
        format: combine(
          colorize(),
          label({label: path}),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          printf(
            // We display the label text between square brackets using ${info.label} on the next line
            info => `${info.timestamp} ${info.level}: [${info.label}] ${info.message}`
          )
        )
      }),
      dailyRotateFileTransport
      // new transports.File({
      //   level: 'info',
      //   filename: './apps/api/src/app/logs/all-logs.log', // ???
      //   // handleExceptions: true,
      //   maxsize: 5242880, // 5MB
      //   maxFiles: 5,
      //   format: json(),
      // }),
    ],
    exitOnError: false
  });

  logger.stream = {
    write: function (message, encoding) {
      logger.info(message);
    }
  };

  return logger;
}

export default getLogger;

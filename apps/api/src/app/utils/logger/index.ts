import { createLogger, format, transports } from 'winston';
const { combine, colorize, label, json, timestamp, printf } = format;

const ENV = process.env.NODE_ENV;

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
      new transports.File({
        level: 'info',
        filename: './app/logs/all-logs.log', // ???
        // handleExceptions: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: json(),
      }),
    ],
    exitOnError: false
  });

  // logger.stream({}).on('write', (message, encoding) => {
  //   logger.info(message);
  // });
  return logger;
}

export default getLogger;

// import winston from 'winston';
import debug from 'debug';

const isDev =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'beta';

const logger = {
  // conditionally enable debug logs with env variables.
  // eg
  //   debug('[socket]: connected');
  //   DEBUG=socket
  debug: msg => {
    const matchDebug = msg.match(/\[(.+)\]/);
    if (!matchDebug || debug.enabled(matchDebug[1])) {
      return console.debug(msg);
    }
  },
  info: msg => {
    return console.log(msg);
  },
  warn: msg => {
    return console.warn(msg);
  },
  error: msg => {
    return console.error(msg);
  }
};

// const logger = winston.createLogger({

//   level: isDev ? 'debug' : 'info',
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.json()
//   ),
//   transports: isDev
//     ? [
//         new winston.transports.Console({
//           format: winston.format.simple()
//         })
//       ]
//     : [
//         new winston.transports.Console({
//           format: winston.format.simple()
//         }),
//         //
//         // - Write to all logs with level `info` and below to `combined.log`
//         // - Write all logs error (and below) to `error.log`.
//         //
//         new winston.transports.File({ filename: 'error.log', level: 'error' }),
//         new winston.transports.File({ filename: 'combined.log' })
//       ],
//   exitOnError: false // do not exit on handled exceptions
// });

export default logger;

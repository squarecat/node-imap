import winston from 'winston';
import morgan from 'morgan';
import chalk from 'chalk';

const isDev = process.env.NODE_ENV === 'development';

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  transports: isDev
    ? [
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    : [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ],
  exitOnError: false // do not exit on handled exceptions
});

export default logger;

export const httpLogger = morgan((tokens, req, res) => {
  // color the status code depending on the value
  let status = tokens.status(req, res);
  if (+status < 300) {
    status = chalk.blue(status);
  } else if (+status >= 300 && +status < 500) {
    status = chalk.yellow(status);
  } else {
    status = chalk.red(status);
  }

  // <timestamp> - request: [<method> <url>] <response code> <response time>
  return [
    `${tokens.date(req, res, 'iso')} -`,
    `${chalk.cyan('request')}:`,
    `[${tokens.method(req, res)} ${tokens.url(req, res)}]`,
    status,
    tokens['response-time'](req, res),
    'ms'
  ].join(' ');
});

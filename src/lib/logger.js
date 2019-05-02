import moment from 'moment';
import path from 'path';
import winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      name: 'info-console',
      timestamp: () => moment(),
      formatter: options => `[${options.timestamp().format('YYYY-MM-DD HH-mm-ss')}] : ${options.message || ''}`,
    }),
    new winston.transports.File({
      level: 'info',
      name: 'info-file',
      filename: path.resolve(__dirname, '../..', 'log', `info-${moment().format('YYYYMMDD')}.log`),
      timestamp: () => moment(),
      formatter: options => `[${options.timestamp().format('YYYY-MM-DD HH-mm-ss')}] : ${options.message || ''}`,
      json: false,
    }),
    new winston.transports.Console({
      level: 'error',
      name: 'error-console',
      timestamp: () => moment(),
      formatter: options => `[${options.timestamp().format('YYYY-MM-DD HH-mm-ss')}] : ${options.message || ''}`,
    }),
    new winston.transports.File({
      level: 'error',
      name: 'error-file',
      filename: path.resolve(__dirname, '../..', 'log', `errors-${moment().format('YYYYMMDD')}.log`),
      timestamp: () => moment(),
      formatter: options => `[${options.timestamp().format('YYYY-MM-DD HH-mm-ss')}] : ${options.message || ''}`,
      json: false,
    }),
    new winston.transports.File({
      level: 'request',
      name: 'request-log',
      filename: path.resolve(__dirname, '../..', 'log', `requests-${moment().format('YYYYMMDD')}.log`),
      timestamp: () => moment(),
      formatter: options => `[${options.timestamp().format('YYYY-MM-DD HH-mm-ss')}] : ${options.message || ''}`,
      json: false,
    }),
  ],
});

let defaultLogger = console;


if (process.env.NODE_ENV === 'production') {
  defaultLogger = logger;
}

export default defaultLogger;

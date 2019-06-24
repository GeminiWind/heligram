import expressWinston from 'express-winston';
import moment from 'moment';
import winston from 'winston';
import path from 'path';

const loggingHttpRequest = expressWinston.logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.resolve(__dirname, '../../..', 'log', `${moment().format('YYYY-MM-DD')}.log`),
    }),
  ],
  format: winston.format.combine(
    winston.format.json(),
  ),
  meta: true,
  expressFormat: true,
  colorize: false,
  statusLevels: true,
  baseMeta: {
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
  },
});

export default loggingHttpRequest;

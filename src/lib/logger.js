import moment from 'moment';
import path from 'path';
import { format, transports, createLogger } from 'winston';

const logger = createLogger({
  format: format.combine(
    format.splat(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
      ),
    }),
    new transports.File({
      filename: path.resolve(__dirname, '../..', 'log', `${moment().format('YYYY-MM-DD')}.log`),
    }),
  ],
});

export default logger;

import moment from 'moment';
import path from 'path';
import { format, transports, createLogger } from 'winston';

const logger = createLogger({
  format: format.combine(
    format.splat(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(info => JSON.stringify({
      level: info.level,
      message: info.message,
      meta: {
        timestamp: info.timestamp,
      },
    })),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf(info => JSON.stringify({
          level: info.level,
          message: info.message,
          meta: {
            timestamp: info.timestamp,
          },
        })),
      ),
    }),
    new transports.File({
      filename: path.resolve(__dirname, '../..', 'log', `${moment().format('YYYY-MM-DD')}.log`),
    }),
  ],
});

export default logger;

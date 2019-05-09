import express from 'express';
import bodyParser from 'body-parser';
import {
  storageLibrary,
  logger,
  wrapperController,
  schemaValidator,
} from './lib';
import { login } from './func/auth';
import { malformedErrorHandler } from './lib/middlewares';

const app = express();

// parse JSON body
app.use(bodyParser.json());
// handling malformed JSON error
app.use(malformedErrorHandler);

// decorate utils to event
app.use((req, _, next) => {
  logger.info('STARTING REQUEST \n%s', JSON.stringify(req.body, null, 2));
  req.storageLibrary = storageLibrary;
  req.instrumentation = logger;
  req.schemaValidator = schemaValidator;

  next();
});

app.use((_, res, next) => {
  res.on('finish', () => {
    // TODO: catch up response body to log in here
    logger.info('END REQUEST');
  });

  next();
});

app.post('/login', async (req, res) => await wrapperController(req, res)(login));

export default app;

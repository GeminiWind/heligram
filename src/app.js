import express from 'express';
import bodyParser from 'body-parser';
import {
  storageLibrary,
  logger,
  wrapperController,
  schemaValidator,
} from './lib';
import { login } from './func/auth';
import { MalformedError } from './lib/errors';


const app = express();

app.use(bodyParser.json());

const defaultResponseHeader = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

app.use((e, _, res, next) => {
  // if error is belong to malformed JSON
  if (e instanceof SyntaxError
      && e.status === 400
      && e.message.includes('JSON')
  ) {
    // massage error to JSON API error
    const malformedError = new MalformedError().toJSON();

    res.json(
      {
        errors: [malformedError],
      },
      defaultResponseHeader,
      e.status,
    );
  }

  next();
});

app.use((req, _, next) => {
  // attach storage library and instrumentation to request\
  req.storageLibrary = storageLibrary;
  req.instrumentation = logger;
  req.schemaValidator = schemaValidator;

  next();
});

app.post('/login', async (req, res) => await wrapperController(req, res)(login));

export default app;

import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import {
  storageLibrary,
  logger,
  wrapperController,
  schemaValidator,
  jwtPassport,
} from './lib';
import { UnauthorizedError } from './lib/errors';
import { malformedErrorHandler } from './lib/middlewares';
import routes from './routes';

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

// configure app for user JWT Passport
app.use(passport.initialize());
jwtPassport(passport);

const unaunthorizedErrorHandler = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      const unauthorizedError = new UnauthorizedError().toJSON();

      res.status(unauthorizedError.status).json(
        { errors: [unauthorizedError] },
      );
    }
  })(req, res, next);
};

// initialize routes
routes.map((route) => {
  app[route.method.toLowerCase()](
    route.path,
    route.middlewares.concat(
      route.meta.isProtected ? [unaunthorizedErrorHandler] : [],
    ),
    async (req, res) => await wrapperController(req, res)(route.controller),
  );
});


export default app;

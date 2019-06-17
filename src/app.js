import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import {
  cache,
  storageLibrary,
  logger,
  wrapperController,
  schemaValidator,
  loadEnv,
  jwtPassport,
} from './lib';
import { UnauthorizedError } from './lib/errors';
import { malformedErrorHandler } from './lib/middlewares';
import routes from './routes';

const app = express();

// load environments from config file
loadEnv();
// configure CORS
app.use(cors());
// manipulate JSON
app.use([bodyParser.json(), malformedErrorHandler]);

// decorate utils to event
app.use((req, _, next) => {
  logger.info('STARTING REQUEST \n%s', JSON.stringify(req.body, null, 2));

  req.cache = cache;
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
jwtPassport(passport);

const unauthorizedErrorHandler = (req, res, next) => {
  passport.authenticate('jwt', { session: false, failWithError: true }, (err, user) => {
    if (err || !user) {
      const unauthorizedError = new UnauthorizedError().toJSON();

      res.status(unauthorizedError.status).json(
        { errors: [unauthorizedError] },
      );
    }

    req.user = user;
    next();
  })(req, res, next);
};

// initialize routes
routes.map((route) => {
  if (route.meta.isProtected) {
    route.middlewares.unshift(unauthorizedErrorHandler);
  }

  app[route.method.toLowerCase()](
    route.path,
    route.middlewares,
    async (req, res) => await wrapperController(req, res)(route.controller),
  );
});


export default app;

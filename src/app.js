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
import {
  loggingHttpRequest,
  malformedErrorHandler,
  unauthorizedErrorHandler,
} from './lib/middlewares';
import routes from './routes';

const app = express();

// load environments from config file
loadEnv();
// configure CORS
app.use(cors());
// manipulate JSON and handle malformed error
app.use([bodyParser.json(), malformedErrorHandler]);

app.use(loggingHttpRequest);

app.use((req, _, next) => {
  req.cache = cache;
  req.storageLibrary = storageLibrary;
  req.instrumentation = logger;
  req.schemaValidator = schemaValidator;

  next();
});

// configure app for user JWT Passport
jwtPassport(passport);

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

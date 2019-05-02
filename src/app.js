import express from 'express';
import { storageLibrary, logger } from './lib';

const app = express();

app.use((req, res, next) => {
  // attach storage library and instrumentation to request\
  req.storageLibrary = storageLibrary;
  req.instrumentation = logger;

  next();
});

app.get('/hello', (req, res) => {
  res.json({
    data: {
      type: 'test',
    },
  }).status(200);
});

export default app;

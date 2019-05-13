import { InternalError } from './errors';
import JsonApiError from './jsonApiError';

const wrapperController = (req, res) => async (fn) => {
  const defaultHeader = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const result = await fn(req);

    if (result) {
      res.json(result.body).sendStatus(result.statusCode);
    }
  } catch (error) {
    if (error instanceof JsonApiError) {
      const e = error.toJSON();

      res.set(defaultHeader).status(e.status).json(
        {
          errors: [e],
        },
      );
    } else {
      // if unknown error was thrown
      // then message it to InternalError
      res.set(defaultHeader).sendStatus(500).json(
        {
          errors: [new InternalError().toJSON()],
        },
      );
    }
  }
};

export default wrapperController;

import { InternalError } from './errors';
import JsonApiError from './jsonApiError';
import { DEFAULT_HEADER } from '../constants';

const wrapperController = fn => async (req, res) => {
  try {
    const result = await fn(req);

    if (result) {
      res.status(result.statusCode).json(result.body);
    }
  } catch (error) {
    if (error instanceof JsonApiError) {
      const e = error.toJSON();

      res.set(DEFAULT_HEADER).status(e.status).json(
        {
          errors: [e],
        },
      );
    } else {
      // if unknown error was thrown
      // then message it to InternalError
      res.set(DEFAULT_HEADER).sendStatus(500).json(
        {
          errors: [new InternalError().toJSON()],
        },
      );
    }
  }
};

export default wrapperController;

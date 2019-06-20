import { UnsupportedMediaTypeError } from '../errors';
import { DEFAULT_HEADER } from '../../constants';

export default function unsupportedMediaTypeErrorHandler(_, req, res, next) {
  const allowedMediaTypes = ['application/vnd.api+json'];

  if (!allowedMediaTypes.includes(req.headers['content-type'])) {
    const unsupportedMediaTypeError = new UnsupportedMediaTypeError(`Content-Type '${req.headers['content-type']}' is not allowed.`).toJSON();

    res
      .set(DEFAULT_HEADER)
      .status(unsupportedMediaTypeError.status)
      .json({
        errors: [unsupportedMediaTypeError],
      });

    next(unsupportedMediaTypeError);
  } else {
    next();
  }
}

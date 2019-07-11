import { UnsupportedMediaTypeError, NotAcceptableError } from '../errors';
import { DEFAULT_HEADER } from '../../constants';

export default function validateRequestHeaders(req, res, next) {
  const allowedMediaTypes = ['application/vnd.api+json'];

  if (!allowedMediaTypes.includes(req.headers['content-type'])) {
    const unsupportedMediaTypeError = new UnsupportedMediaTypeError(`Content-Type '${req.headers['content-type']}' is not allowed. Only [${allowedMediaTypes.join()}] is accepted`).toJSON();

    res
      .set(DEFAULT_HEADER)
      .status(unsupportedMediaTypeError.status)
      .json({
        errors: [unsupportedMediaTypeError],
      });
  } else if (!allowedMediaTypes.includes(req.headers.accept)) {
    const e = new NotAcceptableError(`Accept: '${req.headers.accept}' is not allowed. Only [${allowedMediaTypes.join()}] is accepted`).toJSON();

    res
      .set(DEFAULT_HEADER)
      .status(e.status)
      .json({
        errors: [e],
      });
  } else {
    next();
  }
}

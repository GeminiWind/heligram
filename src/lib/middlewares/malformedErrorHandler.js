import { MalformedError } from '../errors';

const defaultResponseHeader = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export default function malformedErrorHandler(e, _, res, next) {
  // if error is belong to malformed JSON
  if (e instanceof SyntaxError
      && e.status === 400
      && e.message.includes('JSON')
  ) {
    // message error to JSON API error
    const malformedError = new MalformedError().toJSON();

    res.json(
      {
        errors: [malformedError],
      },
      defaultResponseHeader,
      malformedError.status,
    );

    next(new MalformedError());
  } else {
    next();
  }
}

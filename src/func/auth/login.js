import jwt from 'jsonwebtoken';
import moment from 'moment';
import { isMatchingWithHashedPassword } from './helper';
import { NotFoundError, BadRequestError } from '../../lib/errors';

export default req => Promise.resolve(req)
  .then(validateRequest)
  .then(getUserByEmail)
  .then(verifyPassword)
  .then(generateToken)
  .then(returnResponse);

export function validateRequest(req) {
  const { schemaValidator, instrumentation } = req;
  const isValid = schemaValidator.validate('https://heligram.com/login-user+v1.json', req.body.data);

  if (!isValid) {
    instrumentation.error('Error in validate request %s', JSON.stringify(schemaValidator.errors, null, 2));

    throw new BadRequestError({
      source: schemaValidator.errors,
    });
  }

  return req;
}

export async function getUserByEmail(req) {
  const {
    instrumentation,
    storageLibrary,
    body: {
      data: {
        email,
      },
    },
  } = req;

  const user = await storageLibrary.findOne({
    Path: `user/${email}`,
  }).lean();

  if (!user) {
    instrumentation.error(`User with ${email} was not found`);

    throw new NotFoundError(`User with ${email} was not found`);
  }

  return {
    ...req,
    user,
  };
}

export function verifyPassword(req) {
  const {
    instrumentation,
    user: {
      Content: {
        password,
      },
    },
  } = req;

  if (!isMatchingWithHashedPassword(req.body.data.password, password)) {
    instrumentation.error('Password does not match');

    throw new BadRequestError('Password does not match.');
  }

  return req;
}

export function generateToken(req) {
  const expiresIn = parseInt('1800', 10); // ~30mins
  const token = jwt.sign(req.user, process.env.APP_KEY, {
    expiresIn, // in seconds
  });
  const expireAt = moment().add(30, 'm').unix();

  return {
    ...req,
    token: `Bearer ${token}`,
    expireAt,
  };
}

export function returnResponse(req) {
  return {
    statusCode: 200,
    body: {
      data: {
        type: 'session',
        attributes: {
          email: req.body.data.email,
          token: req.token,
          expireAt: req.expireAt,
        },
      },
    },
  };
}

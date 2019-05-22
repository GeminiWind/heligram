import jwt from 'jsonwebtoken';
import moment from 'moment';
import { intersection } from 'lodash';
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
    user: user.Content,
  };
}

export function verifyPassword(req) {
  const {
    instrumentation,
    user,
  } = req;

  if (!isMatchingWithHashedPassword(req.body.data.password, user.password)) {
    instrumentation.error('Password does not match');

    throw new BadRequestError('Password does not match.');
  }

  return req;
}

export function generateToken(req) {
  const {
    user,
    body: { data: { scopes } },
  } = req;

  // validate requested scopes
  const grantedScopes = Array.isArray(user.scopes) ? user.scopes : user.scopes.split(' ');
  const wantedScopes = Array.isArray(scopes) ? scopes : scopes.split(' ');

  if (wantedScopes.length > grantedScopes.length) {
    throw new BadRequestError('Your scopes you requested is not available.');
  }
  if (intersection(grantedScopes, wantedScopes) < wantedScopes.length) {
    throw new BadRequestError('User does not have scopes.');
  }

  // generate token
  const token = jwt.sign(
    {
      userEmail: user.email,
      sub: user.email,
      iss: 'api.heligram.com',
      scopes: wantedScopes,
    },
    process.env.APP_KEY,
    {
      expiresIn: '30m',
    },
  );

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
          token: req.token,
          expireAt: req.expireAt,
        },
      },
    },
  };
}

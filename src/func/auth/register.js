import bcrypt from 'bcrypt';
import { BadRequestError, InternalError } from '../../lib/errors';

const SALT_ROUND = 10;

export function validateRequest(req) {
  const { schemaValidator, instrumentation } = req;
  const isValid = schemaValidator.validate('https://heligram.com/create-user+v1.json', req.body);

  if (!isValid) {
    instrumentation.error('Error in validate request %s', JSON.stringify(schemaValidator.errors, null, 2));

    throw new BadRequestError({
      source: schemaValidator.errors,
    });
  }

  return req;
}

export async function isUserEmailExist(req) {
  const {
    instrumentation,
    storageLibrary,
    body: {
      data: {
        attributes: {
          email,
        },
      },
    },
  } = req;

  const user = await storageLibrary.findOne({
    Path: `user/${email}`,
  }).cache({ hKey: `user/${email}` });

  if (user) {
    instrumentation.error(`User with ${email} already exist.`);

    throw new BadRequestError(`User with ${email} already exist.`);
  }

  return req;
}

export async function createUser(req) {
  const {
    instrumentation,
    storageLibrary,
    cache,
    body: {
      data: {
        attributes,
      },
    },
  } = req;

  const salt = bcrypt.genSaltSync(SALT_ROUND);
  const hashedPassword = bcrypt.hashSync(attributes.password, salt);

  const Path = `users/${attributes.email}`;

  const record = {
    Path,
    Content: {
      email: attributes.email,
      password: hashedPassword,
      scopes: 'user:profile create:chat read:chat',
    },
    Type: 'users',
  };

  try {
    await storageLibrary.create(record);
  } catch (error) {
    instrumentation.error('Error in creating user.', error);

    throw new InternalError('Error in creating user.');
  }

  // delete cache record because new record is added successfully
  await cache.del(Path);

  return req;
}

export function returnResponse(req) {
  return {
    statusCode: 201,
    body: {
      data: {
        type: 'users',
        attributes: {
          email: req.body.data.attributes.email,
        },
      },
    },
  };
}

export default req => Promise.resolve(req)
  .then(validateRequest)
  .then(isUserEmailExist)
  .then(createUser)
  .then(returnResponse);

import bcrypt from 'bcrypt';
import { BadRequestError, InternalError } from '../../lib/errors';

export default req => Promise.resolve(req)
  .then(validateRequest)
  .then(isUserEmailExist)
  .then(createUser)
  .then(returnResponse);

function validateRequest(req) {
  const { schemaValidator, instrumentation } = req;
  const isValid = schemaValidator.validate('https://heligram.com/create-user+v1.json', req.body.data);

  if (!isValid) {
    instrumentation.error('Error in validate request %s', JSON.stringify(schemaValidator.errors, null, 2));

    throw new BadRequestError({
      source: schemaValidator.errors,
    });
  }

  return req;
}

async function isUserEmailExist(req) {
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
  });

  if (user) {
    instrumentation.error(`User with ${email} already exist.`);

    throw new BadRequestError(`User with ${email} already exist.`);
  }

  return req;
}

async function createUser(req) {
  const {
    instrumentation,
    storageLibrary,
    body: {
      data,
    },
  } = req;

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(data.password, salt);

  const record = {
    Path: `user/${data.email}`,
    Content: {
      email: data.email,
      password: hashedPassword,
    },
  };

  try {
    await storageLibrary.create(record);
  } catch (error) {
    instrumentation.error('Error in creating user.', error);

    throw new InternalError('Error in creating user.');
  }

  return req;
}

function returnResponse(req) {
  return {
    statusCode: 201,
    body: {
      data: {
        type: 'user',
        attributes: {
          email: req.body.data.email,
          password: req.body.data.password,
        },
      },
    },
  };
}

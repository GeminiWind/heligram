import { promisify } from 'util';
import moment from 'moment';
import { NotFoundError, BadRequestError, InternalError } from '../../lib/errors';

export default req => Promise.resolve(req)
  .then(validateRequest)
  .then(checkUserIsExist)
  .then(updateUserWithResetToken)
  .then(returnResponse);

export function validateRequest(req) {
  const { schemaValidator, instrumentation } = req;
  const isValid = schemaValidator.validate('https://heligram.com/forget-password+v1.json', req.body.data);

  if (!isValid) {
    instrumentation.error('Error in validate request %s', JSON.stringify(schemaValidator.errors, null, 2));

    throw new BadRequestError({
      source: schemaValidator.errors,
    });
  }

  return req;
}

export async function checkUserIsExist(req) {
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

  return req;
}

export async function updateUserWithResetToken(req) {
  const {
    instrumentation,
    storageLibrary,
    body: {
      data: {
        email,
      },
    },
  } = req;

  const randomBytesSync = promisify(crypto.randomBytes);

  const resetPasswordToken = await randomBytesSync(20).toString('hex');
  const resetTokenExpireAt = moment().add(7, 'd').unix();


  try {
    storageLibrary.findOneAndUpdate({ 'Content.email': email },
      { resetPasswordToken, resetTokenExpireAt });
  } catch (error) {
    instrumentation.error('Encounter error when updating reset token for user');

    throw new InternalError('Encounter error when updating reset token for user');
  }

  return {
    ...req,
  };
}

export function sendResetPasswordLinkToUserEmail(req) {
  // TODO: send link to reset
  // do we need to send email here
  // if sent , need to be considered about how to secure token

  return req;
}

export function returnResponse() {
  // how to return token to client to prevent stealing token.
  return {
    statusCode: 200,
    body: {},
  };
}

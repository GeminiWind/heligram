import uuidV4 from 'uuid/v4';
import { InternalError, BadRequestError } from '../../lib/errors';

export default req => Promise.resolve(req)
  .then(validateRequest)
  .then(createChat)
  .then(returnResponse);

export function validateRequest(req) {
  const { schemaValidator, instrumentation } = req;
  const isValid = schemaValidator.validate('https://heligram.com/create-chat+v1.json', req.body.data);

  if (!isValid) {
    instrumentation.error('Error in validate request %s', JSON.stringify(schemaValidator.errors, null, 2));

    throw new BadRequestError({
      source: schemaValidator.errors,
    });
  }

  // TODO: validate participants

  return req;
}

export async function createChat(req) {
  const {
    instrumentation,
    storageLibrary,
  } = req;

  const id = uuidV4();

  const record = {
    Path: `chat/${id}`,
    Content: req.body.data.attributes,
  };

  try {
    await storageLibrary.create(record);
  } catch (error) {
    instrumentation.error('Error in creating chat in storage.', error);

    throw new InternalError('Error in creating chat in storage.');
  }

  return {
    ...req,
    chatId: id,
  };
}

export function returnResponse(req) {
  return {
    statusCode: 201,
    body: {
      data: {
        id: req.chatId,
        ...req.body.data,
      },
    },
  };
}

import {
  validateRequest, createChat, returnResponse,
} from '../create';
import { schemaValidator } from '../../../lib';
import { BadRequestError, InternalError } from '../../../lib/errors';

describe('Create Chat Controller', () => {
  it('can validate request in case that request is matched with schema', () => {
    const request = {
      body: {
        data: {
          type: 'chat',
          attributes: {
            createdBy: 'haidv7@fsoft.com.vn',
            participants: ['haidv7@fsoft.com.vn', 'fake@gmail.com'],
          },
          relationships: {
            messages: {
              data: [
                {
                  type: 'message',
                  attributes: {
                    createdBy: 'haidv7@fsoft.com.vn',
                    message: 'Hello World',
                  },
                },
              ],
            },
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      schemaValidator,
    };

    let error;

    try {
      validateRequest(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeFalsy();
  });

  it('throw \'BadRequestError\'  in case that request does not matches with schema', () => {
    const request = {
      body: {
        data: {
          type: 'wrongType',
          attributes: {
            createdBy: 'haidv7@fsoft.com.vn',
            participants: ['haidv7@fsoft.com.vn', 'fake@gmail.com'],
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      schemaValidator,
    };

    let error;

    try {
      validateRequest(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(BadRequestError);
    expect(error).toMatchSnapshot();
  });

  it('can create chat successfuly', async () => {
    const request = {
      body: {
        data: {
          type: 'chat',
          attributes: {
            createdBy: 'haidv7@fsoft.com.vn',
            participants: ['haidv7@fsoft.com.vn', 'fake@gmail.com'],
          },
          relationships: {
            messages: {
              data: [
                {
                  type: 'message',
                  attributes: {
                    createdBy: 'haidv7@fsoft.com.vn',
                    message: 'Hello World',
                  },
                },
              ],
            },
          },
        },
      },
      storageLibrary: {
        create: jest.fn().mockImplementation(() => Promise.resolve(true)),
      },
    };

    const state = await createChat(request);

    expect(state).toHaveProperty('chatId');
  });

  it('throw \'InternalError\'  in case that error in saving chat into storage', async () => {
    const request = {
      body: {
        data: {
          type: 'chat',
          attributes: {
            createdBy: 'haidv7@fsoft.com.vn',
            participants: ['haidv7@fsoft.com.vn', 'fake@gmail.com'],
          },
          relationships: {
            messages: {
              data: [
                {
                  type: 'message',
                  attributes: {
                    createdBy: 'haidv7@fsoft.com.vn',
                    message: 'Hello World',
                  },
                },
              ],
            },
          },
        },
      },
      storageLibrary: {
        create: jest.fn().mockImplementation(() => Promise.reject(new Error('Runtime error.'))),
      },
      instrumentation: {
        error: jest.fn(),
      },
    };

    let error;

    try {
      await createChat(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(InternalError);
    expect(error).toMatchSnapshot();
  });

  it('can return response correctly', () => {
    const request = {
      body: {
        data: {
          type: 'chat',
          attributes: {
            createdBy: 'haidv7@fsoft.com.vn',
            participants: ['haidv7@fsoft.com.vn', 'fake@gmail.com'],
          },
          relationships: {
            messages: {
              data: [
                {
                  type: 'message',
                  attributes: {
                    createdBy: 'haidv7@fsoft.com.vn',
                    message: 'Hello World',
                  },
                },
              ],
            },
          },
        },
      },
      storageLibrary: {
        create: jest.fn().mockImplementation(() => Promise.resolve(new Error('Runtime error.'))),
      },
      chatId: 'fake-id',
    };

    const response = returnResponse(request);

    expect(response).toHaveProperty('statusCode', 201);
    expect(response).toHaveProperty('body');
    expect(response).toMatchSnapshot();
  });
});

import register, {
  validateRequest,
  isUserEmailExist,
  createUser,
  returnResponse,
} from '../register';
import { schemaValidator } from '../../../lib';
import { BadRequestError, InternalError } from '../../../lib/errors';

describe('Register Controller', () => {
  it('return original request if request is valid with corresponding schema', () => {
    const request = {
      body: {
        data: {
          type: 'users',
          attributes: {
            email: 'validEmail@example.com',
            password: 'validPassword',
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
          type: 'invalid-type',
          attributes: {
            email: 'validEmail@example.com',
            password: 'validPassword',
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

  it('return origin request if intended user email does not exist', async () => {
    const request = {
      body: {
        data: {
          type: 'users',
          attributes: {
            email: 'validEmail@example.com',
            password: 'validPassword',
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      schemaValidator,
      storageLibrary: {
        findOne: jest.fn().mockImplementation(() => ({
          cache: jest.fn().mockImplementation(() => Promise.resolve(false)),
        })),
      },
    };

    let error;

    try {
      await isUserEmailExist(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeUndefined();
  });

  it('throw \'BadRequestError\' if intended user email does exist', async () => {
    const request = {
      body: {
        data: {
          type: 'invalid-type',
          attributes: {
            email: 'emailExist@example.com',
            password: 'validPassword',
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      schemaValidator,
      storageLibrary: {
        findOne: jest.fn().mockImplementation(() => ({
          cache: jest.fn().mockImplementation(() => Promise.resolve({
            Type: 'users',
            Content: {
              email: 'emailExist@example.com',
              password: 'fake-hashed-password',
            },
            Attributes: {
              createdAt: '2019-12-12 08:00:00+07:00',
              updatedAt: '2019-12-12 08:00:00+07:00',
            },
          })),
        })),
      },
    };

    let error;

    try {
      await isUserEmailExist(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(BadRequestError);
    expect(error).toMatchSnapshot();
  });

  it('can create new user', async () => {
    const request = {
      body: {
        data: {
          type: 'users',
          attributes: {
            email: 'emailExist@example.com',
            password: 'validPassword',
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      storageLibrary: {
        create: jest.fn().mockImplementation(() => Promise.resolve(true)),
      },
      cache: {
        del: jest.fn().mockImplementation(() => Promise.resolve(true)),
      },
    };

    let error;

    try {
      await createUser(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeUndefined();
    expect(request.storageLibrary.create.mock.calls.length).toBe(1);
    expect(request.cache.del.mock.calls.length).toBe(1);
  });

  it('throw \'InternalError\' if it encounters any error when saving record in database ', async () => {
    const request = {
      body: {
        data: {
          type: 'users',
          attributes: {
            email: 'emailExist@example.com',
            password: 'validPassword',
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      storageLibrary: {
        create: jest.fn().mockImplementation(() => Promise.reject(new Error('Runtime error'))),
      },
      cache: {
        del: jest.fn().mockImplementation(() => Promise.resolve(true)),
      },
    };

    let error;

    try {
      await createUser(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(InternalError);
    expect(request.storageLibrary.create.mock.calls.length).toBe(1);
    expect(request.instrumentation.error.mock.calls.length).toBe(1);
    expect(request.cache.del.mock.calls.length).toBe(0);
  });

  it('can return response correctly', () => {
    const request = {
      body: {
        data: {
          type: 'invalid-type',
          attributes: {
            email: 'emailExist@example.com',
            password: 'validPassword',
          },
        },
      },
    };

    const response = returnResponse(request);

    expect(response).toHaveProperty('statusCode', 201);
    expect(response).toHaveProperty('body');
    expect(response).toMatchSnapshot();
  });

  it('create new user successfully as whole flow', async () => {
    const request = {
      body: {
        data: {
          type: 'users',
          attributes: {
            email: 'emailExist@example.com',
            password: 'validPassword',
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      schemaValidator,
      storageLibrary: {
        findOne: jest.fn().mockImplementation(() => ({
          cache: jest.fn().mockImplementation(() => Promise.resolve(false)),
        })),
        create: jest.fn().mockImplementation(() => Promise.resolve(true)),
      },
      cache: {
        del: jest.fn().mockImplementation(() => Promise.resolve(true)),
      },
    };

    const response = await register(request);

    expect(response).toHaveProperty('statusCode', 201);
    expect(response).toHaveProperty('body');
    expect(response).toMatchSnapshot();
  });
});

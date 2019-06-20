import login, {
  validateRequest,
  getUserByEmail,
  verifyPassword,
  verifyRefreshToken,
  exchangeRefreshTokenToAccessToken,
  generateAccessToken,
  returnResponse,
} from '../login';
import { schemaValidator } from '../../../lib';
import { BadRequestError, NotFoundError } from '../../../lib/errors';

describe('Login Controller', () => {
  beforeAll(() => {
    process.env.APP_KEY = 'mock-app-key';
  });

  afterAll(() => {
    delete process.env.APP_KEY;
  });

  it('can validate request in case that request is matched with \'password\' grantType schema', () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'password',
            email: 'validEmail@example.com',
            password: 'validPassword',
            scopes: 'user:profile create:chat read:chat',
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

  it('can validate request in case that request is matched with \'refreshToken\' grantType schema', () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'refreshToken',
            refreshToken: 'mock-refreshToken',
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
          type: 'tokens',
          attributes: {
            email: 'invalidEmail',
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

  it('can get user by their email', async () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'password',
            email: 'validEmail@example.com',
            password: 'validPassword',
            scopes: 'user:profile create:chat read:chat',
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      schemaValidator,
      storageLibrary: {
        findOne: jest.fn().mockImplementation(() => ({
          cache: jest.fn().mockImplementation(() => ({
            lean: jest.fn().mockImplementation(() => Promise.resolve({
              Path: 'user/validEmail@example.com',
              Content: {
                email: 'validEmail@example.com',
                password: 'validPassword',
              },
            })),
          })),
        })),
      },
    };

    const state = await getUserByEmail(request);

    expect(state.user).toBeDefined();
    expect(state.user).toMatchSnapshot();
  });

  it('throw \'NotFoundError\' if user does not exist', async () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'password',
            email: 'validEmail@example.com',
            password: 'validPassword',
            scopes: 'user:profile create:chat read:chat',
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      schemaValidator,
      storageLibrary: {
        findOne: jest.fn().mockImplementation(() => ({
          cache: jest.fn().mockImplementation(() => ({
            lean: jest.fn().mockImplementation(() => Promise.resolve(false)),
          })),
        })),
      },
    };

    let error;

    try {
      await getUserByEmail(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toMatchSnapshot();
  });

  // FIXME: get real hashed password
  it('can verify password if password is correct', () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'password',
            email: 'validEmail@example.com',
            password: 'temando@123',
          },
        },
      },
      user: {
        email: 'validEmail@example.com',
        password: '$2b$10$lmtfpvxcPqC/tjJdqe7T6e3s.xWA2KxUQLZsA794xZTk.cJSQeIxi',
      },
      instrumentation: {
        error: jest.fn(),
      },
    };

    const state = verifyPassword(request);

    expect(state).toBeDefined();
    expect(state).toMatchSnapshot();
  });

  it('can generate token for specified user', async () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'password',
            email: 'validEmail@example.com',
            password: 'validPassword',
            scopes: 'user:profile create:chat read:chat',
          },
        },
      },
      user: {
        email: 'validEmail@example.com',
        password: 'notCorrect',
        scopes: 'user:profile create:chat read:chat',
      },
      cache: {
        set: jest.fn().mockImplementation(value => Promise.resolve(value)),
      },
    };

    const state = await generateAccessToken(request);

    expect(state).toHaveProperty('refreshToken');
    expect(state).toHaveProperty('accessToken');
    expect(state).toHaveProperty('expireAt');
  });

  it('throw \'BadRequestError\' if requested scope for user is not valid', async () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'password',
            email: 'validEmail@example.com',
            password: 'validPassword',
            scopes: 'user:profile create:chat read:chat delete:user',
          },
        },
      },
      user: {
        email: 'validEmail@example.com',
        password: 'notCorrect',
        scopes: 'user:profile create:chat read:chat',
      },
      cache: {
        set: jest.fn().mockImplementation(value => Promise.resolve(value)),
      },
    };

    let error;

    try {
      await generateAccessToken(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(BadRequestError);
  });

  it('can return response correctly', () => {
    const request = {
      accessToken: 'Berear mockToken',
      refreshToken: 'mock-refreshToken',
      expireAt: '123456',
    };

    const response = returnResponse(request);

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('body');
    expect(response).toMatchSnapshot();
  });

  it('return original state if provided refreshToken is valid', async () => {
    const request = {
      cache: {
        get: jest.fn().mockImplementation(() => Promise.resolve(JSON.stringify({
          email: 'validEmail@example.com',
          scopes: 'user:profile create:chat read:chat',
        }))),
      },
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'refreshToken',
            refreshToken: 'mock-refreshToken',
          },
        },
      },
    };

    let error;

    try {
      await verifyRefreshToken(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeUndefined();
  });

  it('throw \'BadRequestError\' if provided refreshToken is invalid', async () => {
    const request = {
      cache: {
        get: jest.fn().mockImplementation(() => Promise.resolve(undefined)),
      },
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'refreshToken',
            refreshToken: 'invalid-refreshToken',
          },
        },
      },
    };

    let error;

    try {
      await verifyRefreshToken(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(BadRequestError);
    expect(error).toMatchSnapshot();
  });

  it('success for the whole flow in case grantType is \'password\'', async () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'password',
            email: 'validEmail@example.com',
            password: 'temando@123',
            scopes: 'user:profile create:chat read:chat',
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      schemaValidator,
      storageLibrary: {
        findOne: jest.fn().mockImplementation(() => ({
          cache: jest.fn().mockImplementation(() => ({
            lean: jest.fn().mockImplementation(() => Promise.resolve({
              Path: 'user/validEmail@example.com',
              Content: {
                email: 'validEmail@example.com',
                password: '$2b$10$lmtfpvxcPqC/tjJdqe7T6e3s.xWA2KxUQLZsA794xZTk.cJSQeIxi',
                scopes: 'user:profile create:chat read:chat',
              },
            })),
          })),
        })),
      },
      cache: {
        set: jest.fn().mockImplementation(value => Promise.resolve(value)),
      },
    };

    const response = await login(request);

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty(['body', 'data', 'attributes', 'accessToken']);
    expect(response).toHaveProperty(['body', 'data', 'attributes', 'expireAt']);
    expect(response).toHaveProperty(['body', 'data', 'attributes', 'refreshToken']);
  });

  it('success for the whole flow in case grantType is \'refreshToken\'', async () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
            grantType: 'refreshToken',
            refreshToken: 'valid-refreshToken',
          },
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      schemaValidator,
      storageLibrary: {
        findOne: jest.fn().mockImplementation(() => ({
          cache: jest.fn().mockImplementation(() => ({
            lean: jest.fn().mockImplementation(() => Promise.resolve({
              Path: 'user/validEmail@example.com',
              Content: {
                email: 'validEmail@example.com',
                password: '$2b$10$lmtfpvxcPqC/tjJdqe7T6e3s.xWA2KxUQLZsA794xZTk.cJSQeIxi',
                scopes: 'user:profile create:chat read:chat',
              },
            })),
          })),
        })),
      },
      cache: {
        get: jest.fn().mockImplementation(() => Promise.resolve(JSON.stringify({
          email: 'validEmail@example.com',
          scopes: 'user:profile create:chat read:chat',
        }))),
      },
    };

    const response = await login(request);

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty(['body', 'data', 'attributes', 'accessToken']);
    expect(response).toHaveProperty(['body', 'data', 'attributes', 'expireAt']);
    expect(response).toHaveProperty(['body', 'data', 'attributes', 'refreshToken']);
  });
});

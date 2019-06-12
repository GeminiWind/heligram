import login, {
  validateRequest, getUserByEmail, verifyPassword, generateToken, returnResponse,
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

  it('can validate request in case that request is matched with schema', () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
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
      console.log(e);
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
          lean: jest.fn().mockImplementation(() => Promise.resolve({
            Path: 'user/validEmail@example.com',
            Content: {
              email: 'validEmail@example.com',
              password: 'validPassword',
            },
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
          lean: jest.fn().mockImplementation(() => Promise.resolve(false)),
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
  it.skip('can verify password if password is correct', () => {
    const request = {
      body: {
        data: {
          email: 'validEmail@example.com',
          password: 'validPassword', // TODO: get real hashed password here
        },
      },
      user: {
        email: 'validEmail@example.com',
        password: 'hashedPassword',
      },
      instrumentation: {
        error: jest.fn(),
      },
    };

    const state = verifyPassword(request);

    expect(state).toBeDefined();
    expect(state).toMatchSnapshot();
  });

  it('can generate token for specified user', () => {
    const request = {
      body: {
        data: {
          type: '',
          attributes: {
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
    };

    const state = generateToken(request);

    expect(state).toHaveProperty('token');
    expect(state).toHaveProperty('expireAt');
  });

  it('throw BadRequestError if requested scope for user is not valid', () => {
    const request = {
      body: {
        data: {
          type: 'tokens',
          attributes: {
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
    };

    let error;

    try {
      generateToken(request);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(BadRequestError);
  });

  it('can return response correctly', () => {
    const request = {
      token: 'Berear mockToken',
      expireAt: '123456',
    };

    const response = returnResponse(request);

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('body');
    expect(response).toMatchSnapshot();
  });

  // FIXME: get the real hashed password
  it.skip('success for the whole flow', () => {
    const request = {
      body: {
        data: {
          email: 'validEmail@example.com',
          password: 'validPassword',
          scopes: 'user:profile create:chat read:chat',
        },
      },
      instrumentation: {
        error: jest.fn(),
      },
      schemaValidator,
      storageLibrary: {
        findOne: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockImplementation(() => Promise.resolve({
            Path: 'user/validEmail@example.com',
            Content: {
              email: 'validEmail@example.com',
              password: 'validPassword',
            },
          })),
        })),
      },
    };

    const response = login(request);

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('body');
    expect(response).toMatchSnapshot();
  });
});

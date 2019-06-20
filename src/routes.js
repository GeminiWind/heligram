import { login, register } from './func/auth';
import { jwtAuthz } from './lib/middlewares';

const routes = [
  {
    path: '/health',
    method: 'GET',
    controller: () => ({
      statusCode: 200,
      body: {},
    }),
    middlewares: [],
    meta: {
      isProtected: false,
    },
  },
  {
    path: '/tokens',
    method: 'POST',
    controller: login,
    middlewares: [],
    meta: {
      isProtected: false,
    },
  },
  {
    path: '/users',
    method: 'POST',
    controller: register,
    middlewares: [],
    meta: {
      isProtected: false,
    },
  },
  {
    path: '/users',
    method: 'GET',
    controller: req => ({
      statusCode: 200,
      body: {
        data: {
          type: 'users',
          attributes: {
            ...req.user,
          },
        },
      },
    }),
    middlewares: [(req, res, next) => jwtAuthz(req, res, next)(['user:profile'])],
    meta: {
      isProtected: true,
    },
  },
];

export default routes;

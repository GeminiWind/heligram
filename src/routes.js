import { login, register } from './func/auth';
import { jwtAuthz } from './lib/middlewares';

const routes = [
  {
    path: '/login',
    method: 'POST',
    controller: login,
    middlewares: [],
    meta: {
      isProtected: false,
    },
  },
  {
    path: '/user/create',
    method: 'POST',
    controller: register,
    middlewares: [],
    meta: {
      isProtected: false,
    },
  },
  {
    path: '/user',
    method: 'GET',
    controller: req => ({
      statusCode: 200,
      body: {
        data: {
          type: 'user',
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

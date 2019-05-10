import { login } from './func/auth';

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
    path: '/private',
    method: 'GET',
    controller: () => ({
      statusCode: 200,
      body: {},
    }),
    middlewares: [],
    meta: {
      isProtected: true,
    },
  },
];

export default routes;
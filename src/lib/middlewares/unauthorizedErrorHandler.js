import passport from 'passport';
import { UnauthorizedError } from '../errors';

export default function unauthorizedErrorHanlder(req, res, next) {
  passport.authenticate('jwt', { session: false, failWithError: true }, (err, user) => {
    if (err || !user) {
      const unauthorizedError = new UnauthorizedError().toJSON();

      res.status(unauthorizedError.status).json(
        { errors: [unauthorizedError] },
      );
    }

    req.user = user;
    next();
  })(req, res, next);
}

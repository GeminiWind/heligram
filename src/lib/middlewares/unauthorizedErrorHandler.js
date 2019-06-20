import passport from 'passport';
import { UnauthorizedError } from '../errors';
import { DEFAULT_HEADER } from '../../constants';

export default function unauthorizedErrorHanlder(req, res, next) {
  passport.authenticate('jwt', { session: false, failWithError: true }, (err, user) => {
    if (err || !user) {
      const unauthorizedError = new UnauthorizedError().toJSON();

      res
        .set(DEFAULT_HEADER)
        .status(unauthorizedError.status)
        .json({
          errors: [unauthorizedError],
        });

      next(new UnauthorizedError());
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
}

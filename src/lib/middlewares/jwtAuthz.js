import { intersection } from 'lodash';
import { ForbiddenError } from '../errors';

const checkScopes = (grantedScopes, apiScopes) => {
  const wantedScopes = Array.isArray(apiScopes) ? apiScopes : apiScopes.split(' ');

  if (wantedScopes.length > grantedScopes.length) {
    throw new ForbiddenError();
  }
  if (intersection(grantedScopes, wantedScopes) < wantedScopes.length) {
    throw new ForbiddenError();
  }

  return true;
};

export default function jwtAuthz(req, res, next) {
  return function (apiScopes) {
    const grantedScopes = req.user.scopes;

    try {
      checkScopes(grantedScopes, apiScopes);
      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        const e = error.toJSON();

        res.status(e.status).json(
          {
            errors: [e],
          },
        );
      }
    }
  };
}

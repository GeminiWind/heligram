import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import storageLibrary from './storageLibrary';

export default function jwtPassport(passport) {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.APP_KEY,
  };

  passport.use(new JwtStrategy(options, (jwtPayload, done) => {
    const {
      _doc: {
        Path,
      },
    } = jwtPayload;
    storageLibrary.findOne({
      Path,
    }).then((user) => {
      if (user) done(null, user);
      done(null, false);
    }).catch(error => done(error, false));
  }));
}

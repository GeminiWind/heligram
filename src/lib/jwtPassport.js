import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import storageLibrary from './storageLibrary';

export default function jwtPassport(passport) {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.APP_KEY || 'lol',
  };

  passport.use(new JwtStrategy(options, (jwtPayload, done) => {
    const {
      _doc: {
        path,
      },
    } = jwtPayload;
    storageLibrary.findOne({
      Path: path,
    }).then((user) => {
      if (user) done(null, user);
      done(null, false);
    }).catch(error => done(error, false));
  }));
}

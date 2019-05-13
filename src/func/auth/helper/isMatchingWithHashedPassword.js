import bcrypt from 'bcrypt';

export default function isMatchingWithHashedPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

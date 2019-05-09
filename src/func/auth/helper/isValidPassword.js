import bcrypt from 'bcrypt-nodejs';

export default function isValidPassword(password, encryptedPassword) {
  return bcrypt.compareSync(password, encryptedPassword);
}

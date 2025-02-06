import * as bcrypt from 'bcrypt';

export function hashPassword(textPassword: string) {
  return bcrypt.hash(textPassword, 10);
}

export function verifyPassword(textPassword: string, hash: string) {
  return bcrypt.compare(textPassword, hash);
}

// src/utils/passwordUtils.js
import bcrypt from 'bcryptjs';
const ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

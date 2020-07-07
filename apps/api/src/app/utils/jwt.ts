import * as jwt from 'jsonwebtoken';
import config from '../config';

export interface Payload {
  username: string;
}

export const createJWT = (username: string) => {
  const payLoad: Payload = { username: username };
  return jwt.sign(payLoad, config.get('secret'), { expiresIn: '2 days' }); // JWT_Secret should be variable in the form `proces.env.JWT_Secret`
}
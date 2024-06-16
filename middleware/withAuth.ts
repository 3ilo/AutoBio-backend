import { Request, Response, NextFunction } from 'express';
import jwt, {
  JwtPayload,
  Secret,
  VerifyCallback,
  VerifyErrors
} from 'jsonwebtoken';

require('dotenv').config();
const cookies = require('cookie-parser');

export interface IToken {
  email: string;
}

export interface CustomRequest extends Request {
  email: string | JwtPayload;
}

const withAuth = function (req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Unauthorized: No token provided');
      next();
    } else {
      const decoded = jwt.verify(token, process.env.AUTH_SECRET ?? '');
      (req as CustomRequest).email = decoded;
      next();
    }
  } catch {
    res.status(401).send('Unauthorized: Invalid token');
    next();
  }
};
module.exports = withAuth;

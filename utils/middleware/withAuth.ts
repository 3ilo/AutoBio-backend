import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
const { checkCacheAndReject } = require('./tokenBlacklist');

const config = require('../config');
const cookies = require('cookie-parser');

export interface IToken {
  email: string;
}

export interface AuthenticatedRequest extends Request {
  email: string | JwtPayload;
}

const withAuth = function (req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Unauthorized: No token provided');
    } else {
      if (!checkCacheAndReject(token, res)) {
        const decoded = jwt.verify(token, config.AUTH_SECRET ?? '');
        (req as AuthenticatedRequest).email = decoded;
        console.log((req as AuthenticatedRequest).email);
        next();
      }
    }
  } catch {
    res.status(401).send('Unauthorized: Invalid token');
  }
};
module.exports = withAuth;

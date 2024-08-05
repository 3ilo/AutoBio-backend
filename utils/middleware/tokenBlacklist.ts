import { Request, Response, NextFunction } from 'express';

const NodeCache = require('node-cache');
const ttlCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 120,
  maxKeys: 1000
});

const logger = require('../logger');

const checkCacheAndReject = function (
  token: string,
  res: Response,
  next: NextFunction
) {
  logger.info(ttlCache.get(token));
  if (ttlCache.get(token) != undefined) {
    logger.info(ttlCache.get(token));
    res.status(401).send('Unauthorized, please try again later.');
    return true;
  }
  return false;
};

const addTokenToCache = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const jwt = req.cookies.token;
  if (jwt) {
    ttlCache.set(jwt, true);
  }
  next();
};

module.exports = {
  checkCacheAndReject,
  addTokenToCache
};

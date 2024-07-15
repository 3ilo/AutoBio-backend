import { Request, Response } from 'express';
import { IMemorySchema } from '../models/Memory';
import { CustomRequest } from '../utils/middleware/withAuth'
const logger = require('../utils/logger');
const Memory = require('../models/Memory');
const withAuth = require('../utils/middleware/withAuth.ts');
const memoriesRouter = require('express').Router();

memoriesRouter.get('/', withAuth, function (req: Request, res: Response) {
  logger.info(req.body);
  const emailPayload = (req as CustomRequest).email;
  const email = typeof emailPayload !== 'string' ? emailPayload?.email : emailPayload

  if (!email) {
    res.status(401).json({
        error: 'Not authorized'
      });
  }
  
  Memory.find({ userId: email }).then((memories: IMemorySchema[]) => {
    logger.info(memories);
    res.status(200).send(memories);
  }).catch((err: Error, memory: IMemorySchema) => {
    logger.error(err);
    res.status(500).json({
      error: 'Internal error please try again'
    });
  });
});

module.exports = memoriesRouter;
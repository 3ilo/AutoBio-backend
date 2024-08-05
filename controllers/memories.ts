import { Request, Response } from 'express';
import { IMemorySchema } from '../models/Memory';
import { AuthenticatedRequest } from '../utils/middleware/withAuth';
const logger = require('../utils/logger');
const Memory = require('../models/Memory');
const withAuth = require('../utils/middleware/withAuth.ts');
const memoriesRouter = require('express').Router();

// GET all user's memories
memoriesRouter.get('/', withAuth, function (req: Request, res: Response) {
  logger.info(req.body);
  const emailPayload = (req as AuthenticatedRequest).email;
  const email =
    typeof emailPayload !== 'string' ? emailPayload?.email : emailPayload;

  if (!email) {
    res.status(401).json({
      error: 'Not authorized'
    });
  }

  Memory.find({ userId: email })
    .then((memories: IMemorySchema[]) => {
      logger.info(memories);
      res.status(200).send(memories);
    })
    .catch((err: Error, memory: IMemorySchema) => {
      logger.error(err);
      res.status(500).json({
        error: 'Internal error please try again'
      });
    });
});

// POST a new memory for user
memoriesRouter.post('/add', withAuth, function (req: Request, res: Response) {
  logger.info(req.body);
  const emailPayload = (req as AuthenticatedRequest).email;
  const email =
    typeof emailPayload !== 'string' ? emailPayload?.email : emailPayload;

  if (!email) {
    res.status(401).json({
      error: 'Not authorized'
    });
  }

  const { title, contents, date } = req.body;

  const memory = new Memory({ title, contents, date, userId: email });

  memory
    .save()
    .then((_: any) => {
      res.status(200).send('Memory saved!');
    })
    .catch((error: any) => {
      logger.info(error);
      res.status(500).send('Error adding memory please try again');
    });
});

module.exports = memoriesRouter;

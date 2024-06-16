import { Request, Response } from 'express';
import { IUserSchema } from '../models/User';
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const withAuth = require('../utils/middleware/withAuth.ts');
const config = require('../utils/config');
const logger = require('../utils/logger');
const authRouter = require('express').Router();

// Check if token is valid
authRouter.get('/checkToken', withAuth, function (req: Request, res: Response) {
  res.sendStatus(200);
});

// POST route to register a user
authRouter.post('/register', function (req: Request, res: Response) {
  const { email, password } = req.body;
  const user = new User({ email, password });
  user
    .save()
    .then((_: any) => {
      res.status(200).send('Welcome to the club!');
    })
    .catch((error: any) => {
      res.status(500).send('Error registering new user please try again');
    });
});

// POST route to authenticate a user
authRouter.post('/authenticate', function (req: Request, res: Response) {
  logger.info(req.body);
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user: IUserSchema) => {
      if (!user) {
        res.status(401).json({
          error: 'Incorrect email or password'
        });
      } else {
        user.isCorrectPassword(
          password,
          function (err: any, same: Boolean | null | undefined) {
            if (err) {
              res.status(500).json({
                error: 'Internal error please try again'
              });
            } else if (!same) {
              res.status(401).json({
                error: 'Incorrect email or password'
              });
            } else {
              // Issue token
              const payload = { email };
              const token = jwt.sign(payload, config.AUTH_SECRET, {
                expiresIn: '1h'
              });
              res.cookie('token', token, { httpOnly: true }).sendStatus(200);
            }
          }
        );
      }
    })
    .catch((err: Error, user: IUserSchema) => {
      logger.error(err);
      res.status(500).json({
        error: 'Internal error please try again1'
      });
    });
});

module.exports = authRouter;

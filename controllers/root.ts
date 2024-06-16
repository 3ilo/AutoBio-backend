import { Request, Response } from 'express';
const withAuth = require('../utils/middleware/withAuth.ts');
const rootRouter = require('express').Router();

rootRouter.get('/home', (req: Request, res: Response) => {
  res.send('Welcome!');
});

rootRouter.get('/secret', withAuth, function (req: Request, res: Response) {
  res.send('The password is potato');
});

module.exports = rootRouter;

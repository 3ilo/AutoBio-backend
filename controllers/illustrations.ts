import { Request, Response } from 'express';
const illustrationsRouter = require('express').Router();
const withAuth = require('../utils/middleware/withAuth.ts');
const upload = require('../utils/middleware/imageHandler.ts');

illustrationsRouter.post('/upload', [withAuth, upload ], (req: Request, res: Response) => {
  res.json({ message: 'Image uploaded successfully' });
});

module.exports = illustrationsRouter;
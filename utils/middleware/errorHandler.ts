import { Request, Response, NextFunction } from 'express';

const errorHandler = function (err: Error, req: Request, res: Response, next: NextFunction) {
    res.status(500).json({
      error: err.message,
    });
  }

module.exports = errorHandler;

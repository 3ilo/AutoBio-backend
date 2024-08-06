import { NextFunction, Request, Response } from 'express';
import {
  getSignedUrl,
  S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";
import { AuthenticatedRequest } from '../utils/middleware/withAuth';
import { JwtPayload } from 'jsonwebtoken';
import { IdPServerResponse } from 'mongodb';
const illustrationsRouter = require('express').Router();
const withAuth = require('../utils/middleware/withAuth.ts');
const upload = require('../utils/middleware/imageHandler.ts');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const localConfig = require('../utils/config');

illustrationsRouter.post(
  '/upload',
  [withAuth, upload],
  (req: Request, res: Response) => {
    res.json({ message: 'Image uploaded successfully' });
  }
);

const s3Client = new S3Client({
  region: localConfig.AWS_REGION,
  credentials: {
    accessKeyId: localConfig.ILLUSTRATIONS_S3_ACCESS_KEY_ID,
    secretAccessKey: localConfig.ILLUSTRATIONS_S3_SECRET_ACCESS_KEY
  }
});

type createPresignedUrlWithClientType = {
  region: string;
  bucket: string;
  key: string
}

const createPresignedUrlWithClient = ({ region, bucket, key }: createPresignedUrlWithClientType) => {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

const generateImageKey = (req: Request, res: Response) => {
  const username = typeof (req as AuthenticatedRequest).email !== 'string'
    ? ((req as AuthenticatedRequest).email as JwtPayload).email
    : (req as AuthenticatedRequest).email;

  if (!username) {
    res.status(500).json({
      error: 'Cannot generate upload url without username'
    });
  }

  const { title } = req.body;

  if (!title) {
    res.status(500).json({
      error: 'Cannot generate upload url without title'
    });
  }

  return Date.now().toString() + '-' + username + '-' + title;
}

illustrationsRouter.post(
  '/generatePresignedUrl', withAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientUrl = await createPresignedUrlWithClient({
        region: localConfig.AWS_REGION,
        bucket: localConfig.ILLUSTRATION_S3_BUCKET_NAME,
        key: generateImageKey(req, res),
      });
      if (!clientUrl) {
        res.status(500).json({
          error: 'Unknown internal issue: cannot generate upload url'
        });
      }
      res.status(200).json({putUrl: clientUrl})
    } catch(e) {
      res.status(500).json({
        error: `Internal issue: cannot generate upload url: [${e}]`
      });
    }
  }
);

module.exports = illustrationsRouter;

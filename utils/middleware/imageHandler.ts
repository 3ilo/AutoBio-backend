import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './withAuth'
import { JwtPayload } from 'jsonwebtoken';
import  multer, { FileFilterCallback } from 'multer';
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const localConfig = require('../config');
const path = require('path')

type FileNameCallback = (error: Error | null, filename: string) => void

const s3Client = new S3Client({
    region: localConfig.AWS_REGION,
    credentials: {
        accessKeyId: localConfig.ILLUSTRATIONS_S3_ACCESS_KEY_ID,
        secretAccessKey: localConfig.ILLUSTRATIONS_S3_SECRET_ACCESS_KEY,
    },
});

function checkFileType(file: any, cb: FileFilterCallback){
    // Allowed ext
    const filetypes = new RegExp('/jpeg|jpg|png/');
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null, true);
    } else {
      return cb(null, false);
    }
  }

const uploadImageMiddleWare = (req: Request, res: Response, next: NextFunction) => {
    const username = ((typeof (req as AuthenticatedRequest).email !== 'string') ? ((req as AuthenticatedRequest).email as JwtPayload).email : (req as AuthenticatedRequest).email)

    if (!username) {
        throw Error("Cannot save image without username");
    }
    
    const generateImageId = function(file: Express.Multer.File) {
        return Date.now().toString() + '-' + username + '-' + file.originalname
    }
      
    const upload = multer({
        storage: multerS3({
            s3: s3Client,
            bucket: localConfig.ILLUSTRATION_S3_BUCKET_NAME,
            acl: 'bucket-owner-full-control',
            key: function (req: Request, file: Express.Multer.File, cb: FileNameCallback) {
                cb(null, generateImageId(file));
            },
        }),
        fileFilter: function(_req: Request, file: Express.Multer.File, cb: FileFilterCallback){
            checkFileType(file, cb);
        },
    })

    upload.single('image')(req, res, next);
}
    
module.exports = uploadImageMiddleWare;
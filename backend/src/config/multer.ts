import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve('uploads')),
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(6).toString('hex');
    cb(null, `${hash}-${file.originalname}`);
  }
});

export const upload = multer({ storage });
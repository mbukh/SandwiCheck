import type { Request } from 'express';
import createHttpError from 'http-errors';
import type { FileFilterCallback } from 'multer';
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype) {
    // create req.file.extension
    file.extension = file.mimetype.split('/')[1];
    return cb(null, true);
  }
  cb(createHttpError.BadRequest('Invalid image file type. Only JPEG and PNG are allowed'));
};

const limits = {
  fileSize: Number.parseInt(process.env.MAX_UPLOAD_SIZE_IN_BYTE ?? '', 10),
};

const upload = multer({ storage, limits, fileFilter });

export default upload;

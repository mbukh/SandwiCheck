import type { Request } from 'express';
import createHttpError from 'http-errors';
import type { FileFilterCallback } from 'multer';
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // Anchor to the full MIME type so values like "application/jpeg-x" or "x/png" can't pass.
  const filetypes = /^image\/(jpe?g|png)$/;
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype) {
    // create req.file.extension
    file.extension = file.mimetype.split('/')[1];
    return cb(null, true);
  }
  cb(createHttpError.BadRequest('Invalid image file type. Only JPEG and PNG are allowed'));
};

const limits = {
  // Default to 10MB when the env var is unset/invalid, so a misconfig can't disable the cap (NaN = no limit).
  fileSize: Number.parseInt(process.env.MAX_UPLOAD_SIZE_IN_BYTES ?? '', 10) || 10_485_760,
};

const upload = multer({ storage, limits, fileFilter });

export default upload;

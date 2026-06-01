import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import sharp from 'sharp';

const width = Number.parseInt(process.env.USER_IMAGE_WIDTH ?? '', 10);
const height = Number.parseInt(process.env.USER_IMAGE_HEIGHT ?? '', 10);

const resizeImage: RequestHandler = async (req, res, next) => {
  if (req.file) {
    try {
      const resizedBuffer = await sharp(req.file.buffer)
        .resize(width, height, { fit: 'cover' })
        .jpeg({ quality: 65 })
        .toBuffer();

      req.file.buffer = resizedBuffer;
    } catch {
      return next(createHttpError.BadRequest('Unsupported image format'));
    }
  }

  next();
};

export default resizeImage;

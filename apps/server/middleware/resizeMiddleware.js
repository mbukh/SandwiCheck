import sharp from 'sharp';
import createHttpError from 'http-errors';

const width = parseInt(process.env.USER_IMAGE_WIDTH, 10);
const height = parseInt(process.env.USER_IMAGE_HEIGH, 10);

const resizeImage = async (req, res, next) => {
  if (req.file) {
    try {
      const resizedBuffer = await sharp(req.file.buffer)
        .resize(width, height, { fit: 'cover' })
        .jpeg({ quality: 65 })
        .toBuffer();

      req.file.buffer = resizedBuffer;
    } catch (err) {
      return next(createHttpError.BadRequest('Unsupported image format'));
    }
  }

  next();
};

export default resizeImage;

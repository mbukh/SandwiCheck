import sharp from "sharp";
import createHttpError from "http-errors";

const width = Number(process.env.USER_IMAGE_WIDTH);
const height = Number(process.env.USER_IMAGE_HEIGHT);

const resizeAndCrop = async (req, res, next) => {
    if (req.file) {
        try {
            const resizedBuffer = await sharp(req.file.buffer)
                .resize(width, height, { fit: "cover" })
                .jpeg({ quality: 65 })
                .toBuffer();

            req.file.extension = "jpeg";

            req.file.buffer = resizedBuffer;
        } catch (err) {
            return next(createHttpError(400, "Unsupported image format"));
        }
    }

    next();
};

export default resizeAndCrop;

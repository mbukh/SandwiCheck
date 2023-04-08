import sharp from "sharp";
import createHttpError from "http-errors";

import heicConvert from "heic-convert";

const width = Number(process.env.USER_IMAGE_WIDTH);
const height = Number(process.env.USER_IMAGE_HEIGHT);

const resizeAndCrop = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        if (req.file.extension === "heic") {
            const res = await heicConvert.all({
                buffer: req.file.buffer,
                format: "JPEG",
            });
            console.log(res);
            console.log(res);
            console.log(res);
        }

        const resizedBuffer = await sharp(req.file.buffer)
            .resize(width, height, { fit: "cover" })
            .jpeg({ quality: 80 })
            .toBuffer();

        req.file.extension = "jpeg";

        req.file.buffer = resizedBuffer;
    } catch (err) {
        console.log(err);
        return next(createHttpError(400, "Unsupported image format"));
    }
};

export default resizeAndCrop;

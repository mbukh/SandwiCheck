import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import multer from "multer";

import createHttpError from "http-errors";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype) {
        // create req.file.extension
        file.extension = file.mimetype.split("/")[1];
        return cb(null, true);
    }
    cb(createHttpError.BadRequest("Invalid image file type. Only JPEG and PNG are allowed"));
};

const limits = {
    fileSize: parseInt(process.env.MAX_UPLOAD_SIZE_IN_BYTE, 10),
};

const upload = multer({ storage, limits, fileFilter });

export default upload;

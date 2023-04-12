import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import multer from "multer";

import createError from "http-errors";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype) {
        // create req.file.extension
        file.extension = file.mimetype.split("/")[1];
        return cb(null, true);
    }
    cb(createError(400, "Invalid image file type. Only JPEG and PNG are allowed"));
};

const limits = {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE_IN_BYTES),
};

const upload = multer({ storage, limits, fileFilter });

export default upload;

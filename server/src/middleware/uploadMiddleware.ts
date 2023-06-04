import dotenv from "dotenv";
import multer, { Options, FileFilterCallback, RequestHandler } from "multer";
import createHttpError from "http-errors";
import { Request } from "express";

dotenv.config({ path: "./config/config.env" });

const storage = multer.memoryStorage();

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype) {
        // create req.file.extension
        (file as any).extension = file.mimetype.split("/")[1];
        return cb(null, true);
    }
    cb(
        createHttpError.BadRequest(
            "Invalid image file type. Only JPEG and PNG are allowed"
        )
    );
};

const limits = {
    fileSize: parseInt(process.env.MAX_UPLOAD_SIZE_IN_BYTE || "0", 10),
};

const uploadOptions: Options = { storage, limits, fileFilter };
const upload: RequestHandler = multer(uploadOptions);

export default upload;

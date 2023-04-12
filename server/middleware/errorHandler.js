import createError from "http-errors";

const errorHandler = (err, req, res, next) => {
    let error = { ...err, message: err.message, status: err.status };

    // Logging
    if (process.env.NODE_ENV !== "production") {
        err.status && console.log(`Error status: ${err.status}`.red);
        err.name && console.log(`Error name: ${err.name}`.red);
        err.code && console.log(`Error code: ${err.code}`.red);
        err.stack && console.log(`Error stack: ${err.stack}`.red);
    }

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        const message = `Resource not found with id ending ...${String(err.value).slice(
            -6
        )} not found`;
        error = createError(404, message);
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field_value = error.message.match(/\{(.*)\}/g)[0].replaceAll('"', "");
        const message = `Duplicate data ${field_value}`;
        error = createError(400, message);
    }
    // Mongoose validation error
    if (err.name === "ValidationError") {
        const message = Object.values(error.errors)
            .map((val) => val.properties.message)
            .join("; ");
        error = createError(400, message);
    }

    if (err.name === "MulterError") {
        if (error.code === "LIMIT_FILE_SIZE") {
            error = createError(
                400,
                `The file is too large. The maximum file size allowed is ${Math.round(
                    Number(process.env.MAX_UPLOAD_SIZE_IN_BYTES) / 1024 / 1024
                )}MB`
            );
        }
    }

    res.status(error.status || 500);
    res.json({
        success: false,
        error: {
            status: error.status,
            message: error.message || "Server Error",
        },
    });
};

export default errorHandler;

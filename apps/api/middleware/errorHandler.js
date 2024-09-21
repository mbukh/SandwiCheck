import createHttpError from 'http-errors';

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message, status: err.status };

  // Logging
  if (process.env.NODE_ENV !== 'production') {
    err.status && console.error(`Error status: ${err.status}`);
    err.name && console.error(`Error name: ${err.name}`);
    err.code && console.error(`Error code: ${err.code}`);
    err.stack && console.error(`Error stack: ${err.stack}`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id ending ...${String(err.value).slice(-6)} not found`;
    error = createHttpError.NotFound(message);
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field_value = error.message.match(/\{(.*)\}/g)[0].replaceAll('"', '');
    const message = `Duplicate data ${field_value}`;
    error = createHttpError.BadRequest(message);
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((val) => val.properties?.message)
      .join('; ');
    error = createHttpError.BadRequest(message);
  }

  if (err.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      error = createHttpError(
        400,
        `The file is too large. The maximum file size allowed is ${Math.round(
          parseInt(process.env.MAX_UPLOAD_SIZE_IN_BYTE, 10) / 1024 / 1024,
        )}MB`,
      );
    }
  }

  res.status(error.status || 500);
  res.json({
    success: false,
    error: {
      status: error.status,
      message: error.message || 'Server Error',
    },
  });
};

export default errorHandler;

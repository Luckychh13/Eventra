export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  if (err.name === "ValidationError" || err.name === "CastError") {
    statusCode = 400;
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
  }

  if (err.code === 11000) {
    statusCode = 409;
    err.message =
      "An event with the same title, date, time, and location already exists.";
  }

  if (
    err.code === "LIMIT_FILE_COUNT" ||
    err.code === "LIMIT_UNEXPECTED_FILE"
  ) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
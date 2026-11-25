export function errorMiddleware(error, _request, response, _next) {
  if (response.headersSent) {
    return;
  }

  let statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : Number.isInteger(error.status)
      ? error.status
      : 500;
  let message = statusCode >= 500 ? 'An unexpected server error occurred.' : error.message;

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    statusCode = 400;
    message = error.message;
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'A booking with this unique identifier already exists.';
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    message
  });
}

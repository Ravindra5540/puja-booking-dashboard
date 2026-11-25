export function notFoundMiddleware(_request, response) {
  response.status(404).json({
    success: false,
    message: 'The requested API route was not found.'
  });
}

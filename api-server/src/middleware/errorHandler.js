const { errorResponse } = require('../helpers/response');

const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404);
};

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada server';
  return errorResponse(res, message, statusCode);
};

module.exports = {
  notFoundHandler,
  errorHandler
};

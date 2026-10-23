
const successResponse = (res, data, message = 'Berhasil', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data: data,
    message: message
  });
};

const errorResponse = (res, message = 'Terjadi kesalahan pada server', statusCode = 500, data = null) => {
  return res.status(statusCode).json({
    success: false,
    data: data,
    message: message
  });
};

module.exports = {
  successResponse,
  errorResponse
};

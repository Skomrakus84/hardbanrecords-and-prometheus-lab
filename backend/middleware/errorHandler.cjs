// Globalny middleware do obsługi błędów
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Wystąpił błąd serwera.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

module.exports = errorHandler;
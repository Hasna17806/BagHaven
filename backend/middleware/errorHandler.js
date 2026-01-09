/*
  GLOBAL ERROR HANDLER
  - Catches all errors
*/
const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
  });
};

export default errorHandler;

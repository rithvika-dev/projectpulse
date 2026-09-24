const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Central Error Handler]', err);
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({
      success: false,
      message,
      errors: [message],
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for '${field}'. Please provide another value.`;
    return res.status(400).json({
      success: false,
      message,
      errors: [message],
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: errors[0] || 'Validation error occurred',
      errors,
    });
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size cannot exceed 15MB limit';
    }
    return res.status(400).json({
      success: false,
      message,
      errors: [err.message || message],
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token',
      errors: ['Invalid token signature'],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization token has expired',
      errors: ['Token expired'],
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error. Something went wrong internally.',
    errors: [error.message || 'Internal server error'],
  });
};

module.exports = errorHandler;

const createError = require("http-errors");
const multer = require('multer');


// Middleware to generate 404 error for undefined routes
const notFoundHandler = (req, res, next) => {
  next(createError.NotFound());
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  
  // Log error details
  console.error('Global error handler caught:', {
    error: err,
    stack: err.stack,
    location: 'middlewares/errorHandler.js:errorHandler',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  });

  res.status(status);
  res.send({
    status: status,
    message: err.message,
  });
};



module.exports = { notFoundHandler, errorHandler, };
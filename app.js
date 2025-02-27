const express = require('express');
const createError = require('http-errors');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/errorHandler");


require('dotenv').config();

const app = express();
// Define allowed origin patterns
const allowedOriginPatterns = [
  /http:\/\/localhost:3000$/,
  /http:\/\/localhost:5173$/,
  /^https:\/\/dshelf-rust\.vercel\.app/,  // Replace with your hosted frontend
];

// Configure CORS options with pattern matching
const corsOptions = {
  origin: (origin, callback) => {
    // Check if the origin matches any of the patterns
    if (
      !origin ||
      allowedOriginPatterns.some((pattern) => pattern.test(origin))
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.get('/', async (req, res, next) => {
  res.send({ message: 'API is working 🚀' });
});

app.use('/api', require('./routes/api.route'));
app.use('/api', require('./routes/bookRoutes'));

// Middleware to generate 404 error for undefined routes
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));

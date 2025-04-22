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

// Define allowed origins explicitly
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'https://dshelf-rust.vercel.app',
  'https://dshelf.store',
  'https://www.dshelf.store'
]);

// Configure CORS options
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Connect to MongoDB
connectDB();

// Apply CORS middleware before any routes
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Other middleware
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
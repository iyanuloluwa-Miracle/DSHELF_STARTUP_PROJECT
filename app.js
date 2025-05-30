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

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'https://dshelf-rust.vercel.app',
  'https://dshelf.store',
  'https://www.dshelf.store'
]);

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
};

// Connect to MongoDB
connectDB();

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // Add logging

app.get('/', async (req, res, next) => {
  res.send({ message: 'API is working 🚀' });
});

// Mount routes with their specific prefixes
app.use('/api/auth', require('./routes/api.route'));
app.use('/api', require('./routes/bookRoutes'));

// Middleware to generate 404 error for undefined routes
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
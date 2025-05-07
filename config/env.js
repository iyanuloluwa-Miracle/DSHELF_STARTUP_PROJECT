// config/env.js
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

module.exports = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: isTest ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    BASE_URL: process.env.BASE_URL || 'http://localhost:5000'
};

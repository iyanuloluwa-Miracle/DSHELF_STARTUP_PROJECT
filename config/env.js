// config/env.js
require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    POSTGRES_URI: process.env.POSTGRES_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000'
};

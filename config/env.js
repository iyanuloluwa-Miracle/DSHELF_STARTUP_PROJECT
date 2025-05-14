// config/env.js
require('dotenv').config();


module.exports = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI:process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    BASE_URL: process.env.BASE_URL || 'http://localhost:5000'
};

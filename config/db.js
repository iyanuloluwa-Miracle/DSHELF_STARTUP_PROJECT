const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { POSTGRES_URI, DB_SSL_CA } = require('./env');

const sequelize = new Sequelize(POSTGRES_URI, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: true,
            ca: DB_SSL_CA,
            checkServerIdentity: () => undefined  // Skip hostname checks
        }
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Add more detailed error logging
const connectDB = async () => {
    try {
        console.log('Attempting to connect to PostgreSQL...');
        console.log('SSL Certificate loaded:', !!DB_SSL_CA);
        console.log('SSL Certificate length:', DB_SSL_CA?.length);
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('✅ PostgreSQL connected successfully');
    } catch (error) {
        console.error('❌ PostgreSQL connection error:', error);
        // Add more detailed error logging
        if (error.original) {
            console.error('Original error:', error.original.message);
            console.error('Error code:', error.original.code);
        }
        process.exit(1);
    }
};


module.exports = { sequelize, connectDB };

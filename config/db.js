const { Sequelize } = require('sequelize');
const { POSTGRES_URI } = require('./env');

const sequelize = new Sequelize(POSTGRES_URI, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // This will create tables if they don't exist
        console.log('PostgreSQL connected successfully');
    } catch (error) {
        console.error('PostgreSQL connection error:', error);
        process.exit(1);
    }
};

module.exports = { 
    sequelize, 
    connectDB 
};
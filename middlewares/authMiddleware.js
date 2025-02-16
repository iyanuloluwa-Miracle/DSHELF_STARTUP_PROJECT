const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { errorResponse, HttpStatus } = require('../helpers/responses');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(HttpStatus.UNAUTHORIZED).json(
                errorResponse('Authentication required')
            );
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Check if token has expired
            if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
                return res.status(HttpStatus.UNAUTHORIZED).json(
                    errorResponse('Token has expired. Please login again.')
                );
            }

            // Add user info to request
            req.user = decoded;
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(HttpStatus.UNAUTHORIZED).json(
                    errorResponse('Token has expired. Please login again.')
                );
            }
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(HttpStatus.UNAUTHORIZED).json(
                    errorResponse('Invalid token. Please login again.')
                );
            }
            throw jwtError;
        }
    } catch (error) {
        return res.status(HttpStatus.UNAUTHORIZED).json(
            errorResponse('Authentication failed: ' + error.message)
        );
    }
};

module.exports = { authenticate };

// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(HttpStatus.UNAUTHORIZED).json(
                errorResponse('Authentication required')
            );
        }

        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(HttpStatus.UNAUTHORIZED).json(
            errorResponse('Invalid or expired token')
        );
    }
};

module.exports = {  
    authenticate
}
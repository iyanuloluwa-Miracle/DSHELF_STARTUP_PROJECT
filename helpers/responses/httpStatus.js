// utils/responses/httpStatus.js
/**
 * HTTP Status codes used in the application
 */
const HttpStatus = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    
    // Additional status codes can be added as needed
};

module.exports = HttpStatus;
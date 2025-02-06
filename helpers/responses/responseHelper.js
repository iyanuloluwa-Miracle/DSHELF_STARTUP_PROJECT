// utils/responses/responseHelper.js
/**
 * Standard response format for API endpoints
 * @param {boolean} success - Indicates if the operation was successful
 * @param {string} message - Human-readable message describing the result
 * @param {object|null} data - Optional data payload for successful responses
 * @param {object|null} errors - Optional error details for failed responses
 * @returns {object} Formatted response object
 */
const standardResponse = (success, message, data = null, errors = null) => ({
    success,
    message,
    data,
    errors,
    timestamp: new Date().toISOString()
});

/**
 * Predefined success response
 * @param {string} message - Success message
 * @param {object|null} data - Optional data payload
 * @returns {object} Formatted success response
 */
const successResponse = (message, data = null) => 
    standardResponse(true, message, data, null);

/**
 * Predefined error response
 * @param {string} message - Error message
 * @param {object|null} errors - Optional detailed errors
 * @returns {object} Formatted error response
 */
const errorResponse = (message, errors = null) => 
    standardResponse(false, message, null, errors);

/**
 * Predefined validation error response
 * @param {string} message - Validation error message
 * @param {object} validationErrors - Validation error details
 * @returns {object} Formatted validation error response
 */
const validationErrorResponse = (message, validationErrors) => 
    standardResponse(false, message, null, validationErrors);

module.exports = {
    standardResponse,
    successResponse,
    errorResponse,
    validationErrorResponse
};
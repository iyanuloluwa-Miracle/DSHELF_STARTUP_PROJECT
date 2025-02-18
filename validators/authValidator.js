const { body } = require('express-validator');

exports.signupValidator = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('city').trim().notEmpty().withMessage('City is required')
];

exports.loginValidator = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
];

exports.forgotPasswordValidator = [
    body('email').isEmail().withMessage('Invalid email address')
];

exports.resetPasswordValidator = [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
];


exports.updateProfileValidator = [
    body('firstName').optional().trim().isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters long'),
    body('lastName').optional().trim().isLength({ min: 2 })
        .withMessage('Last name must be at least 2 characters long'),
    body('country').optional().trim().notEmpty()
        .withMessage('Country cannot be empty if provided'),
    body('city').optional().trim().notEmpty()
        .withMessage('City cannot be empty if provided')
];

exports.logoutValidator = [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

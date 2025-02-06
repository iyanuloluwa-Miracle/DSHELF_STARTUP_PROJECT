// controllers/authController.js
const authService = require('../services/authService');
const { 
    successResponse, 
    errorResponse, 
    validationErrorResponse,
    HttpStatus 
} = require('../helpers/responses');

const signup = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            confirm_password, 
            country, 
            city 
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirm_password || !country || !city) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                validationErrorResponse(
                    'All fields are required',
                    {
                        general: 'Please fill in all required fields'
                    }
                )
            );
        }

        const user = await authService.createUser(req.body);
        
        return res.status(HttpStatus.CREATED).json(
            successResponse(
                'User registered successfully. Please verify your email.',
                { userId: user._id }
            )
        );
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json(
            errorResponse(error.message)
        );
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                validationErrorResponse(
                    'Email and password are required',
                    {
                        general: 'Please provide both email and password'
                    }
                )
            );
        }

        const { user, token } = await authService.loginUser(email, password);
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        return res.status(HttpStatus.OK).json(
            successResponse('Login successful', { user, token })
        );
    } catch (error) {
        return res.status(HttpStatus.UNAUTHORIZED).json(
            errorResponse(error.message)
        );
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    return res.status(HttpStatus.OK).json(
        successResponse('Logout successful')
    );
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                validationErrorResponse(
                    'Email is required',
                    {
                        email: 'Please provide an email address'
                    }
                )
            );
        }

        await authService.initiatePasswordReset(email);
        return res.status(HttpStatus.OK).json(
            successResponse('Password reset email sent successfully')
        );
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json(
            errorResponse(error.message)
        );
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirm_password } = req.body;

        if (!token || !newPassword || !confirm_password) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                validationErrorResponse(
                    'All fields are required',
                    {
                        general: 'Please provide token, new password and confirmation'
                    }
                )
            );
        }

        await authService.resetPassword(token, newPassword, confirm_password);
        return res.status(HttpStatus.OK).json(
            successResponse('Password reset successful')
        );
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json(
            errorResponse(error.message)
        );
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                validationErrorResponse(
                    'Verification token is required',
                    {
                        token: 'Please provide a verification token'
                    }
                )
            );
        }

        await authService.verifyEmail(token);
        return res.status(HttpStatus.OK).json(
            successResponse('Email verified successfully')
        );
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json(
            errorResponse(error.message)
        );
    }
};

module.exports = {
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail
};